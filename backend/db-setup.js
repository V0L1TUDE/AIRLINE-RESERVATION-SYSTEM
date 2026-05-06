const fs = require("fs");
const path = require("path");
const oracledb = require("oracledb");
require("dotenv").config();

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const projectRoot = path.resolve(__dirname, "..");
const scriptPaths = [
    "database/01_create_tables.sql",
    "database/02_indexes_views.sql",
    "database/03_sample_data.sql",
    "plsql/functions.sql",
    "plsql/procedures.sql",
    "plsql/triggers.sql"
];

function stripInlineComment(line) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("--") || trimmed.startsWith("PROMPT")) {
        return "";
    }
    return line;
}

function splitOracleScript(sql) {
    const statements = [];
    const lines = sql.split(/\r?\n/);
    let buffer = [];
    let inPlsql = false;

    for (const rawLine of lines) {
        const line = stripInlineComment(rawLine);
        if (!line) continue;

        if (/^\s*CREATE\s+OR\s+REPLACE\s+(FUNCTION|PROCEDURE|TRIGGER)\b/i.test(line)) {
            inPlsql = true;
        }

        if (inPlsql && line.trim() === "/") {
            statements.push(buffer.join("\n").trim());
            buffer = [];
            inPlsql = false;
            continue;
        }

        buffer.push(line);

        if (!inPlsql && line.trim().endsWith(";")) {
            const statement = buffer.join("\n").trim().replace(/;$/, "");
            statements.push(statement);
            buffer = [];
        }
    }

    const trailing = buffer.join("\n").trim();
    if (trailing) statements.push(trailing.replace(/;$/, ""));

    return statements.filter(Boolean);
}

async function runScript(connection, relativePath) {
    const fullPath = path.join(projectRoot, relativePath);
    const sql = fs.readFileSync(fullPath, "utf8");
    const statements = splitOracleScript(sql);

    console.log(`\nRunning ${relativePath}`);

    for (const statement of statements) {
        const firstLine = statement.split(/\r?\n/)[0].slice(0, 90);
        try {
            await connection.execute(statement);
            console.log(`  OK: ${firstLine}`);
        } catch (error) {
            console.error(`  FAILED: ${firstLine}`);
            throw error;
        }
    }
}

async function main() {
    let connection;

    try {
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECT_STRING
        });

        for (const scriptPath of scriptPaths) {
            await runScript(connection, scriptPath);
        }

        await connection.commit();
        console.log("\nDatabase setup completed.");
    } catch (error) {
        console.error("\nDatabase setup failed:");
        console.error(error);
        process.exitCode = 1;
    } finally {
        if (connection) await connection.close();
    }
}

main();
