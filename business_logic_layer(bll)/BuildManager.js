// ============================================================
// BLL Module: BuildManager.js
// Business Logic Layer — Build Processing & Artifact Management
// Project: Automated CI/CD Pipeline with Intelligent Failure Recovery
// ============================================================
//
// SRS Reference   : FR2 (Automated Build — compilation + artifact storage)
// Assignment 5    : BuildManager hosted on Jenkins (EC2)
// Assignment 6 UI : Builds.jsx (success rate bar, artifact table, StatCards)
//
// WHAT THIS IS:
//   BuildManager handles all build-related business logic.
//   It computes success rates, manages artifacts, and enforces
//   build quality thresholds.
//
// IN REAL DEPLOYMENT (Assignment 5):
//   Runs as a Python class inside Jenkins pipeline stage on EC2.
//   Compiles code, stores artifacts in a storage server or S3.
//
// IN YOUR PROJECT:
//   Builds.jsx calls getBuildStats() for StatCards and getArtifacts()
//   for the artifact DataTable.
// ============================================================

import { builds } from '../data/mockData.js';

// ─── BUSINESS RULES ───────────────────────────────────────────────────────────

const MIN_SUCCESS_RATE_THRESHOLD  = 85;    // Below this → WARNING alert
const CRITICAL_SUCCESS_RATE       = 70;    // Below this → CRITICAL alert
const MAX_ARTIFACT_SIZE_MB        = 500;   // Artifacts over this are flagged
const ARTIFACT_RETENTION_DAYS     = 30;    // Older than this → Archive Pending
const SUPPORTED_ARTIFACT_TYPES    = ['.jar', '.zip', '.tar.gz', '.war', '.docker'];

// ─── VALIDATION ───────────────────────────────────────────────────────────────

/**
 * Validates build configuration before queuing a build.
 * SRS FR2: Automated Build — must have valid artifact name + environment.
 * Business Rule: Build cannot proceed without supported artifact extension.
 *
 * @param {object} buildConfig - { artifactName, environment, branch }
 * @returns {object} { isValid, errors[] }
 */
export function validateBuildConfig(buildConfig) {
  const errors = [];

  if (!buildConfig.artifactName || buildConfig.artifactName.trim() === '') {
    errors.push('Artifact name is required.');
  } else {
    const hasValidExt = SUPPORTED_ARTIFACT_TYPES.some(ext => buildConfig.artifactName.endsWith(ext));
    if (!hasValidExt) {
      errors.push(`Artifact must be one of: ${SUPPORTED_ARTIFACT_TYPES.join(', ')}`);
    }
  }

  if (!buildConfig.environment) errors.push('Build environment is required.');
  if (!buildConfig.branch)      errors.push('Target branch is required.');

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates artifact size against the max allowed limit.
 * Business Rule: Artifacts over 500MB are flagged for manual review.
 *
 * @param {number} sizeMB
 * @returns {object} { isValid, warning }
 */
export function validateArtifactSize(sizeMB) {
  if (sizeMB > MAX_ARTIFACT_SIZE_MB) {
    return {
      isValid: false,
      warning: `Artifact size ${sizeMB}MB exceeds limit of ${MAX_ARTIFACT_SIZE_MB}MB. Manual review required.`,
    };
  }
  return { isValid: true, warning: null };
}

// ─── BUSINESS LOGIC ───────────────────────────────────────────────────────────

/**
 * Computes build success rate and applies alert thresholds.
 * SRS FR2: Build quality monitoring.
 * Business Rule: Success rate < 85% → WARNING.
 * Business Rule: Success rate < 70% → CRITICAL.
 * Data Transformation: Raw build array → percentage + alert level.
 *
 * @returns {object} { successRate, alertLevel, passed, failed, total }
 */
export function getBuildSuccessRate() {
  const total  = builds.length;
  const passed = builds.filter(b => b.status === 'success').length;
  const failed = builds.filter(b => b.status === 'failed').length;

  const successRate = total > 0 ? Math.round((passed / total) * 1000) / 10 : 0;

  let alertLevel = 'ok';
  if (successRate < CRITICAL_SUCCESS_RATE)      alertLevel = 'critical';
  else if (successRate < MIN_SUCCESS_RATE_THRESHOLD) alertLevel = 'warning';

  return { successRate, alertLevel, passed, failed, total };
}

/**
 * Gets enriched artifact list for Builds.jsx DataTable.
 * SRS FR2: Artifact storage — only successful builds generate artifacts.
 * Business Rule: Only builds with status 'success' have artifacts.
 * Business Rule: Artifacts older than 30 days are marked 'Archive Pending'.
 * Data Transformation: Raw build records → artifact objects with age + retention status.
 *
 * @returns {Array}
 */
export function getArtifacts() {
  return builds
    .filter(b => b.artifact && b.artifact !== '—' && b.status === 'success')
    .map(b => {
      const ageInDays      = Math.floor((new Date() - new Date(b.date)) / (1000 * 60 * 60 * 24));
      const retentionStatus = ageInDays > ARTIFACT_RETENTION_DAYS ? 'Archive Pending' : 'Active';
      const sizeCategory   = b.sizeMB > 200 ? 'Large' : b.sizeMB > 50 ? 'Medium' : 'Small';

      return {
        build:           b.id,
        artifact:        b.artifact,
        branch:          b.branch,
        date:            b.date,
        ageInDays,
        retentionStatus,
        sizeCategory,
        sizeMB:          b.sizeMB || 'N/A',
      };
    });
}

/**
 * Gets average build duration across all builds.
 * Data Transformation: Duration strings → seconds → averaged → readable format.
 *
 * @returns {string} e.g. "4m 12s"
 */
export function getAverageBuildDuration() {
  const durations = builds
    .filter(b => b.duration && b.duration !== '—')
    .map(b => {
      const m = b.duration.match(/(\d+)m\s*(\d+)?s?/);
      return m ? parseInt(m[1]) * 60 + (parseInt(m[2]) || 0) : 0;
    })
    .filter(d => d > 0);

  if (!durations.length) return 'N/A';
  const avgSec = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
  return `${Math.floor(avgSec / 60)}m ${avgSec % 60}s`;
}

/**
 * Aggregates all build KPIs for Builds.jsx StatCards.
 * Single function that returns everything the UI needs at once.
 *
 * @returns {object}
 */
export function getBuildStats() {
  const { successRate, alertLevel, passed, failed, total } = getBuildSuccessRate();
  const avgDuration  = getAverageBuildDuration();
  const artifacts    = getArtifacts();

  return {
    successRate,
    alertLevel,
    passed,
    failed,
    total,
    avgDuration,
    artifactsStored:         artifacts.length,
    artifactsPendingArchive: artifacts.filter(a => a.retentionStatus === 'Archive Pending').length,
  };
}
