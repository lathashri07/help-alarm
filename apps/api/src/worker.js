import { startQueue, logger } from './platform/index.js';

// Separate process: runs delayed jobs (cancel window, escalation checks, safe-walk timers, retries).
// Each module registers its handlers from jobs.js in Phase 6.
await startQueue();
logger.info('Worker started');