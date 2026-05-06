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

        const context = await connection.execute(`
            SELECT
                USER AS current_user,
                SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') AS current_schema,
                SYS_CONTEXT('USERENV', 'SERVICE_NAME') AS service_name,
                SYS_CONTEXT('USERENV', 'CON_NAME') AS container_name
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
                'VW_RESERVATION_DETAILS',
                'VW_REVENUE_PER_FLIGHT'
            )
            ORDER BY owner, object_type, object_name
        `);

        console.log("Connection:");
        console.table(context.rows);
        console.log("Visible project objects:");
        console.table(objects.rows);
    } catch (error) {
        console.error(error);
        process.exitCode = 1;
    } finally {
        if (connection) await connection.close();
    }
}

main();
