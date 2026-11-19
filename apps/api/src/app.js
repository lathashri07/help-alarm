import express from 'express';
import pinoHttp from 'pino-http';
import { randomUUID } from 'node:crypto';
import { logger, errorHandler } from './platform/index.js';

export function buildApp() {
  const app = express();
  app.use(pinoHttp({ logger, genReqId: () => randomUUID() }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));

  app.use((_req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Not found' } }));
  app.use(errorHandler);
  return app;
}