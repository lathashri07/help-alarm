import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';

export const securityMiddleware = [
  helmet(),
  cors({ origin: config.CORS_ORIGIN.split(','), credentials: true }),
];

/** Global limiter. Auth and OTP routes get a stricter one when Identity is built. */
export const globalRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
});