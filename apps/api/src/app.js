import express from 'express';
import pinoHttp from 'pino-http';
import { randomUUID } from 'node:crypto';
import { logger, errorHandler } from './platform/index.js';
import { securityMiddleware, globalRateLimit } from './platform/security.js';

import * as identity from './modules/identity/http/routes.js';
import * as contacts from './modules/contacts/http/routes.js';
import * as alerts from './modules/alerts/http/routes.js';
import * as escalation from './modules/escalation/http/routes.js';
import * as safewalk from './modules/safewalk/http/routes.js';
import * as tracking from './modules/tracking/http/routes.js';
import * as notifications from './modules/notifications/http/routes.js';
import * as history from './modules/history/http/routes.js';

const modules = [identity, contacts, alerts, escalation, safewalk, tracking, notifications, history];

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
  for (const m of modules) api.use(m.basePath, m.router);
  app.use('/api', api);

  app.use((_req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Not found' } }));
  app.use(errorHandler);
  return app;
}