import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../shared/schema';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Initialize the database connection with retries
const createConnection = async () => {
  try {
    const sql = neon(process.env.DATABASE_URL, {
      connectionTimeoutMillis: 10000, // Increased timeout
      ssl: true,
      maxRetries: 5, // Increased retries
      retryInterval: 1000, // 1 second between retries
      retryOnError: true
    });

    // Test the connection
    await sql`SELECT 1`;
    console.log('Database connection successful!');
    return sql;
  } catch (error) {
    console.error('Failed to create database connection:', error);
    throw error;
  }
};

// Create a connection pool for sessions
const sessionPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000 // Increased timeout
});

// Export the connection promise and pool
export const dbConnection = createConnection();
export { sessionPool };

// Export a function to get the database instance
export async function getDb() {
  const sql = await dbConnection;
  return drizzle(sql, { schema });
} 