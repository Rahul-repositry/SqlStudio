import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.POSTGRE_DB,
  ssl: {
    rejectUnauthorized: process.env.NODE_ENV === "production",
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
