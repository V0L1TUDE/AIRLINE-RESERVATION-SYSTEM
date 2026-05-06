const oracledb = require("oracledb");
require("dotenv").config();

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

async function main() {
    let connection;

    try {
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECT_STRING
        });

        await connection.execute(`
            CREATE OR REPLACE VIEW vw_flight_availability AS
            SELECT
                s.schedule_id,
                f.flight_number,
                f.source_city,
                f.destination_city,
                s.departure_time,
                s.arrival_time,
                s.total_seats,
                s.available_seats,
                ROUND(((s.total_seats - s.available_seats) / s.total_seats) * 100, 2) AS occupancy_percent,
                s.schedule_status
            FROM Schedule s
            JOIN Flight f ON f.flight_id = s.flight_id
        `);

        console.log("Views refreshed successfully.");
    } catch (error) {
        console.error(error);
        process.exitCode = 1;
    } finally {
        if (connection) await connection.close();
    }
}

main();
