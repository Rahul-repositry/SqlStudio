import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.POSTGRE_DB,
  ssl:
    process.env.NODE_ENV === "production"
      ? {
          rejectUnauthorized: true,
          sslmode: "verify-full", // Explicitly set for production
        }
      : {
          rejectUnauthorized: false,
          sslmode: "require", // Explicitly set for development
        },
});

export const connectPostgres = async () => {
  try {
    const client = await pool.connect();
    console.log("PostgreSQL  Connected Successfully");
    client.release();
  } catch (err) {
    console.error("PostgreSQL Connection Error:", err.message);
  }
};

export default pool;
