const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "taskflow",
    password: "SaasAi2026",
    port: 5432
});

module.exports = pool;