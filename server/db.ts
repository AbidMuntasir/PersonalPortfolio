import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../shared/schema';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

console.log('Connecting to database...');
const sql = neon(process.env.DATABASE_URL, {
  connectionTimeoutMillis: 5000,
  ssl: true
});

export const db = drizzle(sql, { schema });

// Create a separate pool for session store
export const sessionPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

// Test the connection
sql`SELECT 1`.then(() => {
  console.log('Database connection successful!');
}).catch((error) => {
  console.error('Database connection failed:', error);
  // Don't throw here, let the application handle the error
}); 