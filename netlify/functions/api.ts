import { Handler } from '@netlify/functions';
import express from 'express';
import serverless from 'serverless-http';
import { registerRoutes } from '../../server/routes';
import { PostgresStorage } from '../../server/pg-storage';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { sessionPool } from '../../server/db';

const app = express();

// Basic middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// Configure session middleware with Postgres store
app.use(session({
  secret: process.env.SESSION_SECRET || 'portfolio-admin-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    path: '/'
  },
  name: 'sessionId',
  proxy: true,
  rolling: true,
  store: new (pgSession(session))({
    pool: sessionPool,
    tableName: 'sessions',
    createTableIfMissing: true
  })
}));

// Add session error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    console.error('Session store connection error:', err);
    // Continue without session for this request
    return next();
  }
  next(err);
});

// Register routes
registerRoutes(app, new PostgresStorage());

// Convert Express app to Netlify function
const serverlessHandler = serverless(app);
export const handler: Handler = async (event, context) => {
  try {
    const result = await serverlessHandler(event, context) as { statusCode?: number; body?: string; headers?: Record<string, string> };
    return {
      statusCode: result.statusCode || 200,
      body: result.body,
      headers: result.headers
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
}; 