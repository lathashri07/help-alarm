import express from 'express';
import pinoHttp from 'pino-http';
import { randomUUID } from 'node:crypto';
import { logger, errorHandler } from './platform/index.js';
import { securityMiddleware, globalRateLimit } from './platform/security.js';

export function buildApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(pinoHttp({ logger, genReqId: () => randomUUID() }));
  app.use(securityMiddleware);
  app.use(express.json({ limit: '100kb' }));

  app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));

  // Everything under /api is rate limited. Module routers are mounted here in the next half.
  const api = express.Router();
  api.use(globalRateLimit);
  app.use('/api', api);

  app.use((_req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Not found' } }));
  app.use(errorHandler);
  return app;
}