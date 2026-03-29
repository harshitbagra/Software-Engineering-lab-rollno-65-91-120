// ============================================================
// BLL Module: FailureAnalyzer.js
// Business Logic Layer — Failure Detection, Classification & Analysis
// Project: Automated CI/CD Pipeline with Intelligent Failure Recovery
// ============================================================
//
// SRS Reference   : FR5 (Failure Detection — real-time monitoring + log capture)
//                   FR6 (Intelligent Analysis — pattern matching + classification)
// Assignment 5    : FailureAnalyzer hosted as Python Backend Service on EC2
//                   REST API: POST /analyzeFailure
// Assignment 6 UI : Failures.jsx (distribution bars, failure table, StatCards,
//                   Rollback button)
//
// WHAT THIS IS:
//   FailureAnalyzer is the "intelligence" of the system.
//   It classifies failure types using pattern matching (SRS FR6),
//   decides if auto-recovery is possible, and validates rollback eligibility.
//
// IN REAL DEPLOYMENT (Assignment 5):
//   Runs as a Python service on EC2.
//   Receives failure events → parses logs → classifies → calls RecoveryManager.
//   REST endpoint: POST /analyzeFailure { buildId, errorLog }
//
// IN YOUR PROJECT:
//   Failures.jsx calls getFailureDistribution() for progress bars,
//   getEnrichedFailures() for the table, rollbackBuild() for the Rollback button.
// ============================================================

import { failures } from '../data/mockData.js';

// ─── BUSINESS RULES ───────────────────────────────────────────────────────────

// SRS FR6: Pattern matching — classify error types
const FAILURE_TYPES = {
  TEST_FAILURE:    'Test Failure',
  BUILD_ERROR:     'Build Error',
  DEPLOY_ERROR:    'Deploy Error',
  NETWORK_TIMEOUT: 'Network Timeout',
};

// Rule: These types can be auto-recovered (SRS FR7)
const AUTO_RECOVERABLE_TYPES = [
  FAILURE_TYPES.NETWORK_TIMEOUT,
  FAILURE_TYPES.TEST_FAILURE,
];

// Rule: These types require manual intervention
const MANUAL_INTERVENTION_TYPES = [
  FAILURE_TYPES.DEPLOY_ERROR,
  FAILURE_TYPES.BUILD_ERROR,
];

// Rule: Production failures are always CRITICAL
const CRITICAL_ENVIRONMENTS = ['production'];

// SRS FR6: Pattern keywords for log-based classification
const FAILURE_PATTERNS = {
  [FAILURE_TYPES.TEST_FAILURE]:    ['test', 'assert', 'spec', 'jest', 'pytest', 'junit'],
  [FAILURE_TYPES.BUILD_ERROR]:     ['build', 'compile', 'syntax', 'import', 'module not found'],
  [FAILURE_TYPES.DEPLOY_ERROR]:    ['deploy', 'kubernetes', 'docker', 'server', 'container'],
  [FAILURE_TYPES.NETWORK_TIMEOUT]: ['timeout', 'network', 'connection', 'refused', 'unreachable'],
};

// ─── VALIDATION ───────────────────────────────────────────────────────────────

/**
 * Validates a failure report before it is logged.
 * SRS FR5: Log capture — every failure must be properly recorded.
 * Business Rule: Build ID, type, and stage are all required.
 *
 * @param {object} failureData - { build, type, stage, environment }
 * @returns {object} { isValid, errors[] }
 */
export function validateFailureReport(failureData) {
  const errors = [];
  if (!failureData.build)  errors.push('Build ID is required.');
  if (!Object.values(FAILURE_TYPES).includes(failureData.type)) {
    errors.push(`Failure type must be one of: ${Object.values(FAILURE_TYPES).join(', ')}`);
  }
  if (!failureData.stage)  errors.push('Failed stage is required.');
  return { isValid: errors.length === 0, errors };
}

/**
 * Validates rollback eligibility for a build.
 * Business Rule: Only FAILED builds can be rolled back.
 * Business Rule: Auto-recoverable failures don't need manual rollback.
 * SRS FR7: One-click or auto-rollback.
 *
 * @param {string} buildId
 * @returns {object} { eligible, reason }
 */
export function validateRollbackEligibility(buildId) {
  const failure = failures.find(f => f.build === buildId);

  if (!failure) {
    return { eligible: false, reason: `Build ${buildId} not found in failure records.` };
  }
  if (failure.status !== 'Failed') {
    return { eligible: false, reason: `Build ${buildId} has not failed. Rollback not needed.` };
  }
  if (AUTO_RECOVERABLE_TYPES.includes(failure.type)) {
    return { eligible: false, reason: `${failure.type} is auto-recoverable. No manual rollback needed.` };
  }
  return {
    eligible: true,
    reason:   `Build ${buildId} failed with ${failure.type}. Manual rollback approved.`,
  };
}

// ─── REST API SIMULATION ──────────────────────────────────────────────────────

/**
 * POST /analyzeFailure
 * Simulates the REST API endpoint from Assignment 5.
 * In real deployment: Python service receives this, parses error logs,
 * classifies failure type, and triggers recovery workflow.
 *
 * SRS FR6: Pattern matching and classification of error types.
 * Data Transformation: Raw error log string → typed failure classification object.
 *
 * @param {object} payload - { buildId, errorLog, stage }
 * @returns {object} { failureType, recoveryStrategy, canAutoRecover, severity }
 */
export function analyzeFailure(payload) {
  const { buildId, errorLog, stage } = payload;

  // SRS FR6: Pattern matching on error log
  const failureType     = classifyFailure(errorLog || '');
  const { canAutoRecover, strategy } = getRecoveryStrategy(failureType);

  // Data Transformation: raw log → structured analysis result
  return {
    buildId,
    stage,
    failureType,
    canAutoRecover,
    recoveryStrategy: strategy,
    severity:         CRITICAL_ENVIRONMENTS.includes(stage) ? 'CRITICAL' : 'STANDARD',
    analyzedAt:       new Date().toISOString(),
    recommendation:   canAutoRecover
      ? `Initiate auto-retry for ${failureType}`
      : `Escalate ${failureType} to manual review`,
  };
}

// ─── BUSINESS LOGIC ───────────────────────────────────────────────────────────

/**
 * Classifies a raw error message into a recognized failure type.
 * SRS FR6: Pattern matching — core intelligence of the system.
 * Data Transformation: Raw error string → typed failure category.
 *
 * @param {string} errorMessage
 * @returns {string} failure type
 */
export function classifyFailure(errorMessage) {
  const msg = errorMessage.toLowerCase();
  for (const [type, keywords] of Object.entries(FAILURE_PATTERNS)) {
    if (keywords.some(kw => msg.includes(kw))) return type;
  }
  return FAILURE_TYPES.BUILD_ERROR; // Default fallback
}

/**
 * Determines recovery strategy based on failure type.
 * SRS FR7: Auto-retry vs rollback decision.
 * Business Rule: Network/Test → auto-retry. Build/Deploy → manual.
 *
 * @param {string} failureType
 * @returns {object} { canAutoRecover, strategy }
 */
export function getRecoveryStrategy(failureType) {
  if (AUTO_RECOVERABLE_TYPES.includes(failureType)) {
    return { canAutoRecover: true, strategy: 'Auto-Retry' };
  }
  if (MANUAL_INTERVENTION_TYPES.includes(failureType)) {
    return { canAutoRecover: false, strategy: 'Manual Intervention Required' };
  }
  return { canAutoRecover: false, strategy: 'Unknown — Escalate to Admin' };
}

/**
 * Computes failure type distribution for Failures.jsx progress bars.
 * Data Transformation: Raw failure array → percentage distribution with UI colors.
 *
 * @returns {Array} [{ type, count, percentage, color, recoverable }]
 */
export function getFailureDistribution() {
  const total      = failures.length;
  if (total === 0) return [];

  const typeCounts = {};
  Object.values(FAILURE_TYPES).forEach(t => { typeCounts[t] = 0; });
  failures.forEach(f => { if (typeCounts[f.type] !== undefined) typeCounts[f.type]++; });

  const colorMap = {
    [FAILURE_TYPES.TEST_FAILURE]:    '#ef4444',
    [FAILURE_TYPES.BUILD_ERROR]:     '#f97316',
    [FAILURE_TYPES.DEPLOY_ERROR]:    '#a855f7',
    [FAILURE_TYPES.NETWORK_TIMEOUT]: '#eab308',
  };

  return Object.entries(typeCounts).map(([type, count]) => ({
    type,
    count,
    percentage:  Math.round((count / total) * 100),
    color:       colorMap[type] || '#6b7280',
    recoverable: AUTO_RECOVERABLE_TYPES.includes(type),
  }));
}

/**
 * Enriches failure records with computed fields for Failures.jsx table.
 * Data Transformation: Raw failure objects → UI-ready enriched objects.
 *
 * @returns {Array}
 */
export function getEnrichedFailures() {
  return failures.map(f => {
    const { canAutoRecover, strategy } = getRecoveryStrategy(f.type);
    const isCritical = CRITICAL_ENVIRONMENTS.includes(f.environment?.toLowerCase());
    return {
      ...f,
      canAutoRecover,
      recoveryStrategy: strategy,
      isCritical,
      severityLabel:    isCritical ? 'CRITICAL' : 'STANDARD',
    };
  });
}

/**
 * Gets failure summary stats for Failures.jsx StatCards.
 * Data Transformation: Array → aggregated KPI object.
 *
 * @returns {object} { total, autoRecovered, manualIntervention, criticalCount }
 */
export function getFailureStats() {
  return {
    total:              failures.length,
    autoRecovered:      failures.filter(f => AUTO_RECOVERABLE_TYPES.includes(f.type)).length,
    manualIntervention: failures.filter(f => MANUAL_INTERVENTION_TYPES.includes(f.type)).length,
    criticalCount:      failures.filter(f => CRITICAL_ENVIRONMENTS.includes(f.environment?.toLowerCase())).length,
  };
}

/**
 * Executes a rollback for an eligible failed build.
 * SRS FR7: One-click rollback.
 * Business Rule: Only eligible builds can be rolled back (checked via validateRollbackEligibility).
 *
 * @param {string} buildId
 * @returns {object} { success, message }
 */
export function rollbackBuild(buildId) {
  const { eligible, reason } = validateRollbackEligibility(buildId);
  if (!eligible) return { success: false, message: reason };

  const failure = failures.find(f => f.build === buildId);
  if (failure) failure.status = 'Rolled Back';

  return { success: true, message: `Rolling back build ${buildId} to last stable version.` };
}
