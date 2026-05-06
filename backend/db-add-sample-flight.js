const oracledb = require("oracledb");
require("dotenv").config();

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const flight = {
    flightNumber: "SW410",
    airlineName: "SkyWay Airlines",
    sourceCity: "Chennai",
    destinationCity: "Hyderabad",
    baseFare: 3900,
    departureTime: new Date("2026-05-15T09:00:00+05:30"),
    arrivalTime: new Date("2026-05-15T10:20:00+05:30"),
    aircraftType: "Airbus A320",
    seats: [
        { number: "1A", seatClass: "Business" },
        { number: "1B", seatClass: "Business" },
        { number: "2A", seatClass: "Economy" },
        { number: "2B", seatClass: "Economy" }
    ]
};

async function main() {
    let connection;

    try {
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECT_STRING
        });

        const existing = await connection.execute(
            `SELECT f.flight_number, s.schedule_id
             FROM Flight f
             JOIN Schedule s ON s.flight_id = f.flight_id
             WHERE f.flight_number = :flightNumber`,
            { flightNumber: flight.flightNumber }
        );

        if (existing.rows.length > 0) {
            console.log(`${flight.flightNumber} already exists. No duplicate flight added.`);
            return;
        }

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
                flightNumber: flight.flightNumber,
                airlineName: flight.airlineName,
                sourceCity: flight.sourceCity,
                destinationCity: flight.destinationCity,
                baseFare: flight.baseFare,
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
                :availableSeats,
                'Scheduled'
             )
             RETURNING schedule_id INTO :scheduleId`,
            {
                flightId,
                departureTime: flight.departureTime,
                arrivalTime: flight.arrivalTime,
                aircraftType: flight.aircraftType,
                totalSeats: flight.seats.length,
                availableSeats: flight.seats.length,
                scheduleId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            }
        );

        const scheduleId = scheduleResult.outBinds.scheduleId[0];

        for (const seat of flight.seats) {
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
                    seatNumber: seat.number,
                    seatClass: seat.seatClass
                }
            );
        }

        await connection.commit();
        console.log(`Added ${flight.flightNumber} with schedule ID ${scheduleId}.`);
    } catch (error) {
        if (connection) await connection.rollback();
        console.error(error);
        process.exitCode = 1;
    } finally {
        if (connection) await connection.close();
    }
}

main();
