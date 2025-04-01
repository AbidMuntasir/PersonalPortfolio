import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../shared/schema';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Initialize the database connection
const sql = neon(process.env.DATABASE_URL, {
  connectionTimeoutMillis: 5000,
  ssl: true,
  maxRetries: 3
});

// Export the database instance
export const db = drizzle(sql, { schema });

// Create a separate pool for session store
export const sessionPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

// Test the connection and export a promise
export const dbConnection = sql`SELECT 1`
  .then(() => {
    console.log('Database connection successful!');
    return true;
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    return false;
  }); 