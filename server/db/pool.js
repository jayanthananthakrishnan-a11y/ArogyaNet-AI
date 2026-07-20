import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgresql@localhost:5432/postgres"
});

export const query = async (text, params) => {
    try {
        console.log('[PG] Executing:', text);
        const res = await pool.query(text, params);
        return res;
    } catch (err) {
        console.error('[PG Error]:', err);
        throw err;
    }
};

export default pool;
