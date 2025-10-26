import pg from "pg";
const { Pool } = pg;

const options = { connectionString: process.env.DATABASE_URL };

// Need SSL for external database connection
if (process.env.NODE_ENV === "production") {
  options.ssl = { rejectUnauthorized: false };
}

// Use Pool instead of Client for multiple concurrent connections
const db = new Pool(options);

export default db;
