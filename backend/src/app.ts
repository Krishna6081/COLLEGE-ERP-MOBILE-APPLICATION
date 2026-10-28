import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

// Security Middlewares
// In development, relax helmet's cross-origin policies so the Expo web
// dev-server (running on a different port) can reach this API.
app.use(
  helmet({
    crossOriginResourcePolicy: env.NODE_ENV === 'development' ? { policy: 'cross-origin' } : undefined,
    crossOriginOpenerPolicy: env.NODE_ENV === 'development' ? false : undefined,
  })
);

// CORS: use `origin: true` to reflect the requester's origin back.
// A wildcard '*' combined with `credentials: true` is rejected by browsers.
const corsOrigin = env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN;
app.use(cors({ origin: corsOrigin, credentials: true }));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Request parsing & Logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root & Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'College ERP Backend API',
    version: '1.0.0',
    status: 'ONLINE',
    timestamp: new Date(),
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'UP', uptime: process.uptime() });
});

// API v1 Router
app.use('/api/v1', routes);

// Centralized Error Handler
app.use(errorHandler);

export default app;
