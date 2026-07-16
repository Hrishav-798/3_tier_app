const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
});

// Log pool-level errors so they don't crash the process silently
pool.on("error", (err) => {
  console.error("Unexpected error on idle database client:", err);
  process.exit(-1);
});

module.exports = pool;
