// ================================================================
// DAL Module: FailureDAL.js
// Data Access Layer — Failures, Recovery Actions, Reports Tables
// Project: Automated CI/CD Pipeline with Intelligent Failure Recovery
// ================================================================
//
// SRS Reference   : FR5, FR6, FR7, FR8, FR9
// Assignment 5    : PostgreSQL on AWS RDS
// Assignment 7 BLL: FailureAnalyzer.js, RecoveryManager.js, ReportGenerator.js
// Assignment 6 UI : Failures.jsx, Recovery.jsx, Reports.jsx
// ================================================================

import { db, query } from './db.js';

// ================================================================
// SECTION 1 — FAILURE DAL
// Table: failures
// ================================================================

/**
 * Inserts a new failure record.
 * Real SQL: INSERT INTO failures (build_number, failure_type, ...) VALUES (...)
 *
 * Called by: FailureAnalyzer.analyzeFailure() after classification
 *
 * @param {object} failureData - { build, type, stage, errorMessage, environment }
 * @returns {object} { success, failure, error }
 */
export function insertFailure(failureData) {
  try {
    if (!failureData.build || !failureData.type || !failureData.stage) {
      return { success: false, failure: null, error: 'build, type, and stage are required.' };
    }

    const VALID_TYPES = ['Test Failure', 'Build Error', 'Deploy Error', 'Network Timeout'];
    if (!VALID_TYPES.includes(failureData.type)) {
      return { success: false, failure: null, error: `Invalid failure type: ${failureData.type}` };
    }

    const result = query('failures', 'INSERT', {
      values: {
        build:        failureData.build,
        type:         failureData.type,
        stage:        failureData.stage,
        errorMessage: failureData.errorMessage || '',
        environment:  failureData.environment || 'staging',
        status:       'Failed',
        isCritical:   failureData.environment === 'production',
        detectedAt:   new Date().toISOString(),
      },
    });

    return { success: true, failure: result.rows[0], error: null };
  } catch (err) {
    return { success: false, failure: null, error: err.message };
  }
}

/**
 * Fetches all failure records.
 * Real SQL: SELECT * FROM failures ORDER BY detected_at DESC
 *
 * Called by: FailureAnalyzer.getEnrichedFailures(), Failures.jsx
 *
 * @returns {Array}
 */
export function getAllFailures() {
  return query('failures', 'SELECT', {}).rows;
}

/**
 * Fetches failures filtered by type.
 * Real SQL: SELECT * FROM failures WHERE failure_type = $1
 *
 * Called by: FailureAnalyzer.getFailureDistribution()
 *
 * @param {string} failureType
 * @returns {Array}
 */
export function getFailuresByType(failureType) {
  return query('failures', 'SELECT', { where: { type: failureType } }).rows;
}

/**
 * Fetches a single failure by build number.
 * Real SQL: SELECT * FROM failures WHERE build_number = $1 LIMIT 1
 *
 * @param {string} buildNumber
 * @returns {object|null}
 */
export function getFailureByBuild(buildNumber) {
  const result = query('failures', 'SELECT', { where: { build: buildNumber } });
  return result.rows[0] || null;
}

/**
 * Updates failure status (e.g., to 'Rolled Back' or 'Resolved').
 * Real SQL: UPDATE failures SET status=$1, resolved_at=$2 WHERE build_number=$3
 *
 * Called by: FailureAnalyzer.rollbackBuild()
 *
 * @param {string} buildNumber
 * @param {string} status - 'Rolled Back' | 'Resolved'
 * @returns {object} { success, rowCount }
 */
export function updateFailureStatus(buildNumber, status) {
  const VALID_STATUSES = ['Failed', 'Rolled Back', 'Resolved'];
  if (!VALID_STATUSES.includes(status)) {
    return { success: false, rowCount: 0, error: `Invalid status: ${status}` };
  }

  const result = query('failures', 'UPDATE', {
    where:  { build: buildNumber },
    values: { status, resolvedAt: new Date().toISOString() },
  });

  return { success: result.rowCount > 0, rowCount: result.rowCount };
}

// ================================================================
// SECTION 2 — RECOVERY DAL
// Tables: recovery_actions, recovery_config
// ================================================================

/**
 * Inserts a new recovery action record.
 * Real SQL: INSERT INTO recovery_actions (build_number, action_type, ...) VALUES (...)
 *
 * Called by: RecoveryManager after executing retry or rollback
 *
 * @param {object} actionData - { build, action, result, duration, retryCount, performedBy }
 * @returns {object} { success, action, error }
 */
export function insertRecoveryAction(actionData) {
  try {
    const VALID_ACTIONS = ['auto-retry', 'rollback', 'manual'];
    if (!VALID_ACTIONS.includes(actionData.action)) {
      return { success: false, action: null, error: `Invalid action type: ${actionData.action}` };
    }

    const result = query('recoveryActions', 'INSERT', {
      values: {
        build:       actionData.build,
        action:      actionData.action,
        result:      actionData.result || 'In Progress',
        duration:    actionData.duration || '—',
        retryCount:  actionData.retryCount || 0,
        performedBy: actionData.performedBy || 'CI/CD System (Auto)',
        performedAt: new Date().toISOString(),
      },
    });

    return { success: true, action: result.rows[0], error: null };
  } catch (err) {
    return { success: false, action: null, error: err.message };
  }
}

/**
 * Fetches all recovery action records.
 * Real SQL: SELECT * FROM recovery_actions ORDER BY performed_at DESC
 *
 * Called by: RecoveryManager.getRecoveryHistory(), Recovery.jsx
 *
 * @returns {Array}
 */
export function getAllRecoveryActions() {
  return query('recoveryActions', 'SELECT', {}).rows;
}

/**
 * Gets the active recovery configuration.
 * Real SQL: SELECT * FROM recovery_config WHERE is_active = TRUE LIMIT 1
 *
 * Called by: RecoveryManager.saveRecoveryConfig() (read before save)
 *
 * @returns {object|null}
 */
export function getActiveRecoveryConfig() {
  return db.recoveryConfig.find(c => c.is_active) || null;
}

/**
 * Saves (upserts) recovery configuration.
 * Real SQL: UPDATE recovery_config SET max_retries=$1, retry_delay_sec=$2 WHERE is_active=TRUE
 *
 * Called by: RecoveryManager.saveRecoveryConfig() after validation
 *
 * @param {object} config - { maxRetries, retryDelay, fallbackAction }
 * @returns {object} { success, rowCount }
 */
export function saveRecoveryConfig(config) {
  const existing = db.recoveryConfig.find(c => c.is_active);
  if (existing) {
    existing.max_retries      = parseInt(config.maxRetries);
    existing.retry_delay_sec  = parseInt(config.retryDelay);
    existing.fallback_action  = config.fallbackAction;
    existing.saved_at         = new Date().toISOString();
    return { success: true, rowCount: 1 };
  }

  const result = query('recoveryConfig', 'INSERT', {
    values: {
      max_retries:      parseInt(config.maxRetries),
      retry_delay_sec:  parseInt(config.retryDelay),
      fallback_action:  config.fallbackAction,
      is_active:        true,
      saved_at:         new Date().toISOString(),
    },
  });

  return { success: result.rowCount > 0, rowCount: result.rowCount };
}

// ================================================================
// SECTION 3 — REPORT DAL
// Table: reports
// ================================================================

/**
 * Inserts a generated report record.
 * Real SQL: INSERT INTO reports (report_id, report_type, ...) VALUES (...)
 *
 * Called by: ReportGenerator.generateReport() after validation
 *
 * @param {object} reportData
 * @returns {object} { success, report, error }
 */
export function insertReport(reportData) {
  try {
    const VALID_TYPES   = ['Pipeline Summary', 'Build Report', 'Failure Analysis', 'Recovery Report'];
    const VALID_FORMATS = ['PDF', 'CSV', 'JSON'];

    if (!VALID_TYPES.includes(reportData.reportType)) {
      return { success: false, report: null, error: `Invalid report type: ${reportData.reportType}` };
    }
    if (!VALID_FORMATS.includes(reportData.format)) {
      return { success: false, report: null, error: `Invalid format: ${reportData.format}` };
    }

    const result = query('reports', 'INSERT', {
      values: {
        reportId:      reportData.reportId || `RPT-${Date.now()}`,
        reportType:    reportData.reportType,
        exportFormat:  reportData.format,
        dateFrom:      reportData.dateFrom,
        dateTo:        reportData.dateTo,
        generatedBy:   reportData.generatedBy || 'Admin',
        totalPipelines: reportData.summary?.totalPipelines || 0,
        passedCount:   reportData.summary?.passed || 0,
        failedCount:   reportData.summary?.failed || 0,
        successRate:   parseFloat(reportData.summary?.successRate) || 0,
        generatedAt:   new Date().toISOString(),
      },
    });

    return { success: true, report: result.rows[0], error: null };
  } catch (err) {
    return { success: false, report: null, error: err.message };
  }
}

/**
 * Fetches all generated reports.
 * Real SQL: SELECT * FROM reports ORDER BY generated_at DESC
 *
 * Called by: Reports.jsx history section
 *
 * @returns {Array}
 */
export function getAllReports() {
  return query('reports', 'SELECT', {}).rows;
}

/**
 * Fetches reports by type.
 * Real SQL: SELECT * FROM reports WHERE report_type = $1
 *
 * @param {string} reportType
 * @returns {Array}
 */
export function getReportsByType(reportType) {
  return query('reports', 'SELECT', { where: { reportType } }).rows;
}
