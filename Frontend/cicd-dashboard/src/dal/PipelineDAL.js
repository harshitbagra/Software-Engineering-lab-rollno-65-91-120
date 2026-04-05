// ================================================================
// DAL Module: PipelineDAL.js
// Data Access Layer — Pipeline Table CRUD Operations
// Project: Automated CI/CD Pipeline with Intelligent Failure Recovery
// ================================================================
//
// SRS Reference   : FR1 (Source Integration), FR2, FR4
// Assignment 5    : PostgreSQL on AWS RDS; pipelines table
// Assignment 7    : BLL module CICDPipeline.js calls these functions
// Assignment 6 UI : Dashboard.jsx, Pipelines.jsx
//
// WHAT THIS IS:
//   PipelineDAL handles all database operations for the 'pipelines' table.
//   It is the ONLY module that directly reads/writes pipeline data.
//   BLL modules (CICDPipeline.js) call these functions — they never
//   touch the database directly.
//
// REAL SQL EQUIVALENTS shown in comments for each function.
// ================================================================

import { db, query } from './db.js';

// ─── CREATE ───────────────────────────────────────────────────────────────────

/**
 * Inserts a new pipeline run into the database.
 * Real SQL: INSERT INTO pipelines (build_number, branch, ...) VALUES (...)
 *
 * Called by: CICDPipeline.startPipeline() after validation passes
 *
 * @param {object} pipelineData
 * @returns {object} { success, pipeline, error }
 */
export function insertPipeline(pipelineData) {
  try {
    // Validate required fields before insert
    if (!pipelineData.build || !pipelineData.branch) {
      return { success: false, pipeline: null, error: 'build_number and branch are required.' };
    }

    // Check for duplicate build number
    const existing = db.pipelines.find(p => p.build === pipelineData.build);
    if (existing) {
      return { success: false, pipeline: null, error: `Build ${pipelineData.build} already exists.` };
    }

    const result = query('pipelines', 'INSERT', {
      values: {
        build:       pipelineData.build,
        branch:      pipelineData.branch,
        commit:      pipelineData.commit || generateHash(),
        triggeredBy: pipelineData.triggeredBy || 'Admin',
        status:      'Running',
        duration:    '—',
        environment: pipelineData.environment || 'staging',
        startedAt:   new Date().toISOString(),
        triggerNote: pipelineData.triggerNote || '',
      },
    });

    return { success: true, pipeline: result.rows[0], error: null };
  } catch (err) {
    return { success: false, pipeline: null, error: err.message };
  }
}

// ─── READ ────────────────────────────────────────────────────────────────────

/**
 * Fetches all pipeline records.
 * Real SQL: SELECT * FROM pipelines ORDER BY started_at DESC
 *
 * Called by: CICDPipeline.getPipelineStats(), Dashboard.jsx
 *
 * @returns {object} { rows, rowCount }
 */
export function getAllPipelines() {
  return query('pipelines', 'SELECT', {});
}

/**
 * Fetches a single pipeline by build number.
 * Real SQL: SELECT * FROM pipelines WHERE build_number = $1 LIMIT 1
 *
 * @param {string} buildNumber - e.g. '#143'
 * @returns {object|null} pipeline record or null
 */
export function getPipelineByBuild(buildNumber) {
  const result = query('pipelines', 'SELECT', { where: { build: buildNumber } });
  return result.rows[0] || null;
}

/**
 * Fetches pipelines filtered by branch.
 * Real SQL: SELECT * FROM pipelines WHERE branch ILIKE $1
 *
 * Called by: CICDPipeline.filterPipelinesByBranch(), Pipelines.jsx filter
 *
 * @param {string} branch - 'all' | 'main' | 'dev' | 'feature'
 * @returns {Array}
 */
export function getPipelinesByBranch(branch) {
  if (!branch || branch === 'all') return getAllPipelines().rows;
  return db.pipelines.filter(p =>
    p.branch.toLowerCase().includes(branch.toLowerCase())
  );
}

/**
 * Fetches pipelines filtered by status.
 * Real SQL: SELECT * FROM pipelines WHERE status = $1
 *
 * @param {string} status - 'Running' | 'Passed' | 'Failed'
 * @returns {Array}
 */
export function getPipelinesByStatus(status) {
  return query('pipelines', 'SELECT', { where: { status } }).rows;
}

/**
 * Fetches pipelines within a date range.
 * Real SQL: SELECT * FROM pipelines WHERE started_at BETWEEN $1 AND $2
 *
 * Called by: ReportGenerator.filterByDateRange()
 *
 * @param {string} startDate
 * @param {string} endDate
 * @returns {Array}
 */
export function getPipelinesByDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end   = new Date(endDate);
  return db.pipelines.filter(p => {
    if (!p.startedAt) return false;
    const d = new Date(p.startedAt);
    return d >= start && d <= end;
  });
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

/**
 * Updates pipeline status and completion time.
 * Real SQL: UPDATE pipelines SET status=$1, completed_at=$2 WHERE build_number=$3
 *
 * Called by: CICDPipeline after each stage completes
 *
 * @param {string} buildNumber
 * @param {string} status - 'Running' | 'Passed' | 'Failed'
 * @param {string|null} duration
 * @returns {object} { success, rowCount }
 */
export function updatePipelineStatus(buildNumber, status, duration = null) {
  const validStatuses = ['Running', 'Passed', 'Failed'];
  if (!validStatuses.includes(status)) {
    return { success: false, rowCount: 0, error: `Invalid status: ${status}` };
  }

  const result = query('pipelines', 'UPDATE', {
    where:  { build: buildNumber },
    values: {
      status,
      duration:     duration || '—',
      completedAt:  status !== 'Running' ? new Date().toISOString() : null,
    },
  });

  return { success: result.rowCount > 0, rowCount: result.rowCount };
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

/**
 * Deletes a pipeline record by build number.
 * Real SQL: DELETE FROM pipelines WHERE build_number = $1
 *
 * @param {string} buildNumber
 * @returns {object} { success, rowCount }
 */
export function deletePipeline(buildNumber) {
  const result = query('pipelines', 'DELETE', { where: { build: buildNumber } });
  return { success: result.rowCount > 0, rowCount: result.rowCount };
}

// ─── HELPER ───────────────────────────────────────────────────────────────────
function generateHash() {
  return Math.random().toString(16).substring(2, 9);
}
