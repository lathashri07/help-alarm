import PgBoss from 'pg-boss';
import { config } from './config.js';

let boss;

/** One pg-boss instance, created on first use. Jobs live in Postgres, so they survive restarts. */
export function getQueue() {
  boss ??= new PgBoss(config.DATABASE_URL);
  return boss;
}

export async function startQueue() {
  const q = getQueue();
  await q.start();
  return q;
}