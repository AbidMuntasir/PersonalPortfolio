import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../shared/schema';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Helper function to delay execution
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize the database connection with special handling for Neon cold starts
const createConnection = async () => {
  const maxRetries = 5;
  let retryCount = 0;
  let lastError: any = null;

  while (retryCount < maxRetries) {
    try {
      console.log(`Connecting to Neon database (attempt ${retryCount + 1}/${maxRetries})...`);
      
      const sql = neon(process.env.DATABASE_URL, {
        connectionTimeoutMillis: 20000, // Increased timeout for cold starts
        ssl: true,
        maxRetries: 3,
        retryInterval: 2000, // Longer interval to allow for compute spin-up
        retryOnError: true
      });

      // Test the connection
      await sql`SELECT 1`;
      console.log('Neon database connection successful!');
      return sql;
    } catch (error: any) {
      lastError = error;
      const isComputeStartingUp = 
        error.message?.includes('ECONNRESET') ||
        error.message?.includes('socket disconnected') ||
        error.message?.includes('fetch failed');
      
      console.warn(`Database connection attempt ${retryCount + 1} failed:`, { 
        error: error.message,
        isProbablyColdStart: isComputeStartingUp
      });
      
      if (isComputeStartingUp) {
        console.log('Detected probable Neon cold start, waiting for compute to initialize...');
        // Wait longer for the first few retries when we suspect a cold start
        const waitTime = retryCount < 2 ? 5000 : 2000;
        console.log(`Waiting ${waitTime}ms before retry...`);
        await sleep(waitTime);
      } else {
        // For other errors, use exponential backoff with jitter
        const baseDelay = 1000;
        const maxDelay = 5000;
        const exponentialDelay = Math.min(
          maxDelay,
          baseDelay * Math.pow(2, retryCount) + Math.random() * 1000
        );
        
        console.log(`Retrying in ${Math.round(exponentialDelay / 1000)} seconds...`);
        await sleep(exponentialDelay);
      }
      
      retryCount++;
    }
  }

  console.error('All database connection attempts failed after', maxRetries, 'retries');
  throw lastError;
};

// Create a connection pool for sessions with better handling of idle compute
let _sessionPool: Pool | null = null;

const getSessionPool = () => {
  if (!_sessionPool) {
    _sessionPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: true,
      max: 10, // Reduce max connections
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 20000, // Increased for cold starts
      application_name: 'portfolio_session_pool'
    });
    
    // Handle pool errors
    _sessionPool.on('error', (err) => {
      console.error('Session pool error:', err);
      // Reset the pool on connection errors that might be related to compute idling
      if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
        console.log('Resetting session pool due to connection error (possible cold start)');
        _sessionPool = null;
      }
    });
  }
  
  return _sessionPool;
};

// Export the connection promise
export const dbConnection = createConnection();
export const sessionPool = getSessionPool();

// Export a function to get the database instance with better error handling
export async function getDb() {
  try {
    const sql = await dbConnection;
    return drizzle(sql, { schema });
  } catch (error) {
    console.error('Error getting database connection, attempting to reconnect...', error);
    // Force reconnection - this will handle cold starts
    const newSql = await createConnection();
    return drizzle(newSql, { schema });
  }
} 