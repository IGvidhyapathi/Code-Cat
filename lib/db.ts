import { Pool } from 'pg';

// Create a new pool using the connection string from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Export a query function that uses the pool
export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
};
