// ============================================================
// BLL Module: RecoveryManager.js
// Business Logic Layer — Retry, Rollback & Recovery
// ============================================================

import { recoveryActions } from '../data/mockData.js';

const MIN_RETRY_ATTEMPTS = 1;
const MAX_RETRY_ATTEMPTS = 10;
const MIN_RETRY_DELAY_SECONDS = 10;
const MAX_RETRY_DELAY_SECONDS = 300;
const FALLBACK_OPTIONS = [
  'rollback', 'notify', 'halt',
  'Rollback Deployment', 'Notify Admin Only', 'Halt Pipeline',
];
const AUTO_ROLLBACK_THRESHOLD = 3;
const NOTIFICATION_CHANNELS = ['email', 'slack', 'dashboard'];

export function validateRecoveryConfig(config) {
  const errors = [];
  const retries = parseInt(config.maxRetries);
  const delay = parseInt(config.retryDelay);

  if (isNaN(retries) || retries < MIN_RETRY_ATTEMPTS || retries > MAX_RETRY_ATTEMPTS) {
    errors.push(`Max retry attempts must be between ${MIN_RETRY_ATTEMPTS} and ${MAX_RETRY_ATTEMPTS}.`);
  }
  if (isNaN(delay) || delay < MIN_RETRY_DELAY_SECONDS || delay > MAX_RETRY_DELAY_SECONDS) {
    errors.push(`Retry delay must be between ${MIN_RETRY_DELAY_SECONDS}s and ${MAX_RETRY_DELAY_SECONDS}s.`);
  }
  if (!FALLBACK_OPTIONS.includes(config.fallbackAction)) {
    errors.push(`Fallback action must be one of: ${FALLBACK_OPTIONS.join(', ')}`);
  }
  return { isValid: errors.length === 0, errors };
}

export function validateNotificationConfig(notifConfig) {
  const errors = [];
  if (!NOTIFICATION_CHANNELS.includes(notifConfig.channel)) {
    errors.push(`Notification channel must be one of: ${NOTIFICATION_CHANNELS.join(', ')}`);
  }
  if (!notifConfig.recipient || notifConfig.recipient.trim() === '') {
    errors.push('Notification recipient is required.');
  }
  return { isValid: errors.length === 0, errors };
}

export function decideRecoveryAction(failureContext) {
  const { failureType, retryCount, isManual } = failureContext;
  if (isManual) {
    return { action: 'manual-intervention', reason: 'Admin requested manual intervention.', shouldEscalate: false };
  }
  if (retryCount >= AUTO_ROLLBACK_THRESHOLD) {
    return { action: 'rollback', reason: `Retry limit reached (${retryCount}/${AUTO_ROLLBACK_THRESHOLD}).`, shouldEscalate: true };
  }
  if (['Network Timeout', 'Test Failure'].includes(failureType)) {
    return { action: 'retry', reason: `${failureType} is auto-recoverable.`, shouldEscalate: false };
  }
  return { action: 'escalate', reason: `${failureType} requires manual review.`, shouldEscalate: true };
}

export function saveRecoveryConfig(config) {
  const validation = validateRecoveryConfig(config);
  if (!validation.isValid) {
    return { success: false, message: 'Invalid configuration.', savedConfig: null, errors: validation.errors };
  }
  const savedConfig = { ...config, savedAt: new Date().toISOString(), savedBy: 'Admin' };
  return { success: true, message: 'Recovery configuration saved successfully.', savedConfig, errors: [] };
}

export function getRecoveryHistory() {
  return recoveryActions.map(action => ({
    ...action,
    outcomeLabel: action.result === 'Success' ? '✅ Recovered'
      : action.result === 'Failed' ? '❌ Failed' : '⏳ In Progress',
    actionLabel: action.action === 'auto-retry' ? '🔄 Auto Retry'
      : action.action === 'rollback' ? '⏪ Rollback' : '👤 Manual',
  }));
}

export function getRecoveryStats() {
  const totalRetries = recoveryActions.filter(a => a.action === 'auto-retry').length;
  const successfulRetries = recoveryActions.filter(a => a.action === 'auto-retry' && a.result === 'Success').length;
  const rollbacks = recoveryActions.filter(a => a.action === 'rollback').length;

  const durations = recoveryActions
    .filter(a => a.duration && a.duration !== '—')
    .map(a => {
      const m = a.duration.match(/(\d+)m?\s*(\d+)?s?/);
      return m ? parseInt(m[1]) * 60 + (parseInt(m[2]) || 0) : 0;
    })
    .filter(d => d > 0);

  const avgSec = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
  const avgMTTR = avgSec > 60 ? `${Math.floor(avgSec / 60)}m ${avgSec % 60}s` : `${avgSec}s`;

  return { totalRetries, successfulRetries, rollbacks, avgMTTR };
}
