const express = require("express");
const cors = require("cors");
const oracledb = require("oracledb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

async function getConnection() {
    return oracledb.getConnection({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectString: process.env.DB_CONNECT_STRING
    });
}

function mapFlight(row) {
    return {
        scheduleId: row.SCHEDULE_ID,
        flightNumber: row.FLIGHT_NUMBER,
        source: row.SOURCE_CITY,
        destination: row.DESTINATION_CITY,
        route: `${row.SOURCE_CITY} to ${row.DESTINATION_CITY}`,
        departure: row.DEPARTURE_TIME,
        arrival: row.ARRIVAL_TIME,
        totalSeats: row.TOTAL_SEATS,
        availableSeats: row.AVAILABLE_SEATS,
        occupancyPercent: row.OCCUPANCY_PERCENT,
        status: row.SCHEDULE_STATUS
    };
}

function mapReservation(row) {
    return {
        id: row.RESERVATION_ID,
        passengerId: row.PASSENGER_ID,
        passengerName: row.PASSENGER_NAME,
        email: row.EMAIL,
        flightNumber: row.FLIGHT_NUMBER,
        source: row.SOURCE_CITY,
        destination: row.DESTINATION_CITY,
        route: `${row.SOURCE_CITY} to ${row.DESTINATION_CITY}`,
        departure: row.DEPARTURE_TIME,
        seatNumber: row.SEAT_NUMBER,
        travelClass: row.SEAT_CLASS,
        fare: row.FARE_AMOUNT,
        status: row.RESERVATION_STATUS,
        paymentStatus: row.PAYMENT_STATUS,
        paymentMethod: row.PAYMENT_METHOD
    };
}

function createSeats(businessSeats, economySeats) {
    const seats = [];
    const letters = ["A", "B", "C", "D", "E", "F"];

    for (let index = 0; index < businessSeats; index += 1) {
        seats.push({
            seatNumber: `1${letters[index % letters.length]}`,
            seatClass: "Business"
        });
    }

    for (let index = 0; index < economySeats; index += 1) {
        const row = Math.floor(index / letters.length) + 2;
        seats.push({
            seatNumber: `${row}${letters[index % letters.length]}`,
            seatClass: "Economy"
        });
    }

    return seats;
}

function splitPassengerName(fullName = "") {
    const cleaned = String(fullName).trim().replace(/\s+/g, " ");
    if (!cleaned) {
        return { firstName: "Guest", lastName: "Passenger" };
    }

    const parts = cleaned.split(" ");
    if (parts.length === 1) {
        return { firstName: parts[0], lastName: "Passenger" };
    }

    return {
        firstName: parts[0],
        lastName: parts.slice(1).join(" ")
    };
}

async function ensurePassengerExists(connection, passengerId, passengerName, email) {
    const lookup = await connection.execute(
        `SELECT passenger_id FROM Passenger WHERE passenger_id = :passengerId`,
        { passengerId }
    );
    if (lookup.rows.length > 0) return;

    if (!email) {
        throw new Error("Passenger email is required when passenger ID does not exist.");
    }

    const byEmail = await connection.execute(
        `SELECT passenger_id FROM Passenger WHERE LOWER(email) = LOWER(:email)`,
        { email }
    );
    if (byEmail.rows.length > 0) {
        throw new Error(
            `Passenger email already exists with different ID (${byEmail.rows[0].PASSENGER_ID}). Use that ID or a different email.`
        );
    }

    const { firstName, lastName } = splitPassengerName(passengerName);
    await connection.execute(
        `INSERT INTO Passenger (
            passenger_id,
            first_name,
            last_name,
            gender,
            date_of_birth,
            email
         )
         VALUES (
            :passengerId,
            :firstName,
            :lastName,
            'Other',
            DATE '2000-01-01',
            :email
         )`,
        {
            passengerId,
            firstName,
            lastName,
            email
        }
    );
}

app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Airline Reservation System API" });
});

app.get("/api/debug-db", async (req, res) => {
    let connection;
    try {
        connection = await getConnection();

        const context = await connection.execute(`
            SELECT
                USER AS current_user,
                SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') AS current_schema,
                SYS_CONTEXT('USERENV', 'SERVICE_NAME') AS service_name
            FROM dual
        `);

        const objects = await connection.execute(`
            SELECT owner, object_name, object_type, status
            FROM all_objects
            WHERE object_name IN (
                'PASSENGER',
                'FLIGHT',
                'SCHEDULE',
                'SEAT',
                'RESERVATION',
                'PAYMENT',
                'VW_FLIGHT_AVAILABILITY',
                'VW_RESERVATION_DETAILS'
            )
            ORDER BY owner, object_type, object_name
        `);

        res.json({
            connection: context.rows[0],
            visibleObjects: objects.rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) await connection.close();
    }
});

app.get("/api/flights", async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(`
            SELECT
                schedule_id,
                flight_number,
                source_city,
                destination_city,
                departure_time,
                arrival_time,
                total_seats,
                available_seats,
                occupancy_percent,
                schedule_status
            FROM vw_flight_availability
            ORDER BY departure_time
        `);
        res.json(result.rows.map(mapFlight));
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) await connection.close();
    }
});

app.post("/api/flights", async (req, res) => {
    const {
        flightNumber,
        airlineName = "SkyWay Airlines",
        sourceCity,
        destinationCity,
        baseFare,
        departureTime,
        arrivalTime,
        aircraftType,
        businessSeats = 0,
        economySeats = 0
    } = req.body;

    const totalSeats = Number(businessSeats) + Number(economySeats);
    let connection;

    if (!flightNumber || !sourceCity || !destinationCity || !baseFare || !departureTime || !arrivalTime || !aircraftType) {
        return res.status(400).json({ error: "All flight and schedule fields are required." });
    }

    if (sourceCity === destinationCity) {
        return res.status(400).json({ error: "Source and destination cannot be the same." });
    }

    if (totalSeats <= 0) {
        return res.status(400).json({ error: "At least one seat is required." });
    }

    try {
        connection = await getConnection();

        const flightResult = await connection.execute(
            `INSERT INTO Flight (
                flight_number,
                airline_name,
                source_city,
                destination_city,
                base_fare,
                status
             )
             VALUES (
                :flightNumber,
                :airlineName,
                :sourceCity,
                :destinationCity,
                :baseFare,
                'Active'
             )
             RETURNING flight_id INTO :flightId`,
            {
                flightNumber,
                airlineName,
                sourceCity,
                destinationCity,
                baseFare: Number(baseFare),
                flightId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            }
        );

        const flightId = flightResult.outBinds.flightId[0];
        const scheduleResult = await connection.execute(
            `INSERT INTO Schedule (
                flight_id,
                departure_time,
                arrival_time,
                aircraft_type,
                total_seats,
                available_seats,
                schedule_status
             )
             VALUES (
                :flightId,
                :departureTime,
                :arrivalTime,
                :aircraftType,
                :totalSeats,
                :totalSeats,
                'Scheduled'
             )
             RETURNING schedule_id INTO :scheduleId`,
            {
                flightId,
                departureTime: new Date(departureTime),
                arrivalTime: new Date(arrivalTime),
                aircraftType,
                totalSeats,
                scheduleId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            }
        );

        const scheduleId = scheduleResult.outBinds.scheduleId[0];
        const seats = createSeats(Number(businessSeats), Number(economySeats));

        for (const seat of seats) {
            await connection.execute(
                `INSERT INTO Seat (
                    schedule_id,
                    seat_number,
                    seat_class,
                    seat_status
                 )
                 VALUES (
                    :scheduleId,
                    :seatNumber,
                    :seatClass,
                    'Available'
                 )`,
                {
                    scheduleId,
                    seatNumber: seat.seatNumber,
                    seatClass: seat.seatClass
                }
            );
        }

        await connection.commit();

        res.status(201).json({
            message: "Flight added successfully.",
            flightId,
            scheduleId,
            totalSeats
        });
    } catch (error) {
        if (connection) await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) await connection.close();
    }
});

app.get("/api/reservations", async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(`
            SELECT
                reservation_id,
                passenger_id,
                passenger_name,
                email,
                flight_number,
                source_city,
                destination_city,
                departure_time,
                seat_number,
                seat_class,
                reservation_status,
                fare_amount,
                payment_status,
                payment_method
            FROM vw_reservation_details
            ORDER BY reservation_id
        `);
        res.json(result.rows.map(mapReservation));
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) await connection.close();
    }
});

app.post("/api/book", async (req, res) => {
    const { passengerId, passengerName, email, scheduleId, travelClass, paymentMethod } = req.body;
    let connection;

    if (!passengerId || !scheduleId || !travelClass || !paymentMethod) {
        return res.status(400).json({
            error: "passengerId, scheduleId, travelClass, and paymentMethod are required."
        });
    }

    try {
        connection = await getConnection();
        await ensurePassengerExists(connection, Number(passengerId), passengerName, email);

        const result = await connection.execute(
            `BEGIN
                pr_book_ticket(
                    p_passenger_id   => :passengerId,
                    p_schedule_id    => :scheduleId,
                    p_travel_class   => :travelClass,
                    p_payment_method => :paymentMethod,
                    p_reservation_id => :reservationId
                );
            END;`,
            {
                passengerId: Number(passengerId),
                scheduleId,
                travelClass,
                paymentMethod,
                reservationId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            }
        );

        const reservationId = Array.isArray(result.outBinds.reservationId)
            ? result.outBinds.reservationId[0]
            : result.outBinds.reservationId;

        res.status(201).json({
            message: "Ticket booked successfully.",
            reservationId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) await connection.close();
    }
});

app.post("/api/cancel/:id", async (req, res) => {
    const reservationId = Number(req.params.id);
    let connection;

    if (!reservationId) {
        return res.status(400).json({ error: "A valid reservation ID is required." });
    }

    try {
        connection = await getConnection();
        await connection.execute(
            `BEGIN
                pr_cancel_ticket(p_reservation_id => :reservationId);
            END;`,
            { reservationId }
        );

        res.json({
            message: "Reservation cancelled successfully.",
            reservationId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) await connection.close();
    }
});

app.listen(port, () => {
    console.log(`Airline Reservation System API running at http://localhost:${port}`);
});
