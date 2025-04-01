import { Handler } from '@netlify/functions';
import express from 'express';
import serverless from 'serverless-http';
import { registerRoutes } from '../../server/routes';
import { PostgresStorage } from '../../server/pg-storage';

const app = express();
app.use(express.json());

// Register your routes with PostgreSQL storage
registerRoutes(app, new PostgresStorage());

// Convert Express app to Netlify function
export const handler: Handler = serverless(app); 