// Single shared pg connection pool for the whole app.
// Connection settings come from environment variables with sensible
// local defaults, so `npm start` works out of the box in development.

const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "",
  database: process.env.PGDATABASE || "blog",
});

module.exports = { pool };
