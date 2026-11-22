import { EventEmitter } from 'node:events';

/**
 * In-process domain events (Phase 3, section 3).
 * Rule: anything that must never be lost is a queue job, not an event.
 */
export const EVENTS = Object.freeze({
  USER_DELETED: 'UserDeleted',
  CONTACT_ADDED: 'ContactAdded',
  CONTACT_OPTED_OUT: 'ContactOptedOut',
  ALERT_CREATED: 'AlertCreated',
  ALERT_DISPATCHED: 'AlertDispatched',
  ALERT_CANCELLED: 'AlertCancelled',
  ALERT_ACKNOWLEDGED: 'AlertAcknowledged',
  ESCALATION_EXHAUSTED: 'EscalationExhausted',
  ALERT_RESOLVED: 'AlertResolved',
  ALERT_CLOSED: 'AlertClosed',
  WALK_STARTED: 'WalkStarted',
  WALK_ENDED: 'WalkEnded',
  DELIVERY_STATUS_CHANGED: 'DeliveryStatusChanged',
});

const bus = new EventEmitter();

export const events = {
  emit(name, payload) {
    if (!Object.values(EVENTS).includes(name)) throw new Error(`Unknown event: ${name}`);
    bus.emit(name, payload);
  },
  on(name, handler) {
    if (!Object.values(EVENTS).includes(name)) throw new Error(`Unknown event: ${name}`);
    bus.on(name, handler);
  },
};