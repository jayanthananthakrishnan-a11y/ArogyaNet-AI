import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

// Use the local PostgreSQL connection string
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgresql@localhost:5432/arogyanet';

export const pool = new Pool({
  connectionString,
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});
