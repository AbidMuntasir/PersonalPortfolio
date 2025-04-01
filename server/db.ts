import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

console.log('Connecting to database...');
const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });

// Test the connection
sql`SELECT 1`.then(() => {
  console.log('Database connection successful!');
}).catch((error) => {
  console.error('Database connection failed:', error);
}); 