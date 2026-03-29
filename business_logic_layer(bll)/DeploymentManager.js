// ============================================================
// BLL Module: DeploymentManager.js
// Business Logic Layer — Container Deployment & Environment Management
// Project: Automated CI/CD Pipeline with Intelligent Failure Recovery
// ============================================================
//
// SRS Reference   : FR4 (Automated Deployment — containerized + environment sync)
// Assignment 5    : DeploymentManager hosted on Docker on EC2
//                   REST API: POST /startPipeline triggers this stage
// Assignment 6 UI : Dashboard.jsx (stage flow — Deploy stage),
//                   Pipelines.jsx (environment column + status badges)
//
// WHAT THIS IS:
//   DeploymentManager handles all deployment-related business logic.
//   It validates deployment targets, enforces environment promotion rules,
//   and tracks deployment status per environment.
//
// IN REAL DEPLOYMENT (Assignment 5):
//   Runs as a Docker container on EC2.
//   Receives build artifact → pulls Docker image → deploys to target env.
//   Communicates with Kubernetes or Docker Compose.
//
// IN YOUR PROJECT:
//   Dashboard.jsx stage flow shows the Deploy stage status.
//   Pipelines.jsx shows environment per pipeline run.
// ============================================================

import { pipelines } from '../data/mockData.js';

// ─── BUSINESS RULES ───────────────────────────────────────────────────────────

// Rule: Environments must be promoted in order — dev → staging → production
const ENVIRONMENT_ORDER = ['development', 'staging', 'production'];

// Rule: Only these environments are valid deployment targets
const VALID_ENVIRONMENTS = ['development', 'staging', 'production'];

// Rule: Production deployments require a passing staging deployment first
const REQUIRES_STAGING_BEFORE_PROD = true;

// Rule: Maximum deployment retries before escalating to rollback
const MAX_DEPLOY_RETRIES = 2;

// ─── VALIDATION ───────────────────────────────────────────────────────────────

/**
 * Validates a deployment request before execution.
 * SRS FR4: Target environment sync — must be valid environment.
 * Business Rule: Cannot deploy to production without a recent staging success.
 *
 * @param {object} deployRequest - { buildId, targetEnvironment, artifactName }
 * @returns {object} { isValid, errors[] }
 */
export function validateDeploymentRequest(deployRequest) {
  const errors = [];

  if (!deployRequest.buildId) {
    errors.push('Build ID is required for deployment.');
  }

  if (!deployRequest.targetEnvironment ||
      !VALID_ENVIRONMENTS.includes(deployRequest.targetEnvironment)) {
    errors.push(`Target environment must be one of: ${VALID_ENVIRONMENTS.join(', ')}`);
  }

  if (!deployRequest.artifactName) {
    errors.push('Artifact name is required for deployment.');
  }

  // Business Rule: production requires staging first
  if (
    REQUIRES_STAGING_BEFORE_PROD &&
    deployRequest.targetEnvironment === 'production'
  ) {
    const hasStagingSuccess = pipelines.some(
      p => p.environment === 'staging' && p.status === 'success'
    );
    if (!hasStagingSuccess) {
      errors.push('Production deployment requires at least one successful staging deployment.');
    }
  }

  return { isValid: errors.length === 0, errors };
}

// ─── BUSINESS LOGIC ───────────────────────────────────────────────────────────

/**
 * Executes a deployment to the target environment.
 * SRS FR4: Containerized deployment.
 * Business Rule: Validation must pass before any deployment runs.
 * Business Rule: Environments must follow promotion order.
 * Data Transformation: Deploy request → deployment record with timestamp.
 *
 * @param {object} deployRequest - { buildId, targetEnvironment, artifactName }
 * @returns {object} { success, deployment, message, errors }
 */
export function deployBuild(deployRequest) {
  const validation = validateDeploymentRequest(deployRequest);
  if (!validation.isValid) {
    return { success: false, deployment: null, message: 'Deployment validation failed.', errors: validation.errors };
  }

  // Data Transformation: request → deployment record
  const deployment = {
    deploymentId:  `DEP-${Date.now()}`,
    buildId:       deployRequest.buildId,
    artifact:      deployRequest.artifactName,
    environment:   deployRequest.targetEnvironment,
    deployedAt:    new Date().toISOString(),
    deployedBy:    'CI/CD System (Auto)',
    status:        'Deploying',
    retryCount:    0,
  };

  return {
    success:    true,
    deployment,
    message:    `Deploying ${deployRequest.artifactName} to ${deployRequest.targetEnvironment}...`,
    errors:     [],
  };
}

/**
 * Gets deployment summary per environment.
 * Data Transformation: Pipeline array → grouped by environment with success rates.
 * Used by Dashboard.jsx and Pipelines.jsx for environment status overview.
 *
 * @returns {Array} [{ environment, total, passed, failed, successRate }]
 */
export function getDeploymentSummaryByEnvironment() {
  return VALID_ENVIRONMENTS.map(env => {
    const envPipelines = pipelines.filter(p => p.environment === env);
    const total        = envPipelines.length;
    const passed       = envPipelines.filter(p => p.status === 'success').length;
    const failed       = envPipelines.filter(p => p.status === 'failed').length;
    const successRate  = total > 0 ? Math.round((passed / total) * 100) : 0;

    return { environment: env, total, passed, failed, successRate };
  });
}

/**
 * Gets environment promotion path for a given environment.
 * Business Rule: Environments must be promoted in order: dev → staging → production.
 * Data Transformation: Environment string → promotion chain object.
 *
 * @param {string} currentEnv
 * @returns {object} { current, next, previous, isProduction }
 */
export function getPromotionPath(currentEnv) {
  const idx = ENVIRONMENT_ORDER.indexOf(currentEnv);
  return {
    current:      currentEnv,
    previous:     idx > 0 ? ENVIRONMENT_ORDER[idx - 1] : null,
    next:         idx < ENVIRONMENT_ORDER.length - 1 ? ENVIRONMENT_ORDER[idx + 1] : null,
    isProduction: currentEnv === 'production',
    step:         idx + 1,
    totalSteps:   ENVIRONMENT_ORDER.length,
  };
}

/**
 * Checks if a deployment should be retried or escalated to rollback.
 * Business Rule: Max 2 deploy retries before forcing rollback.
 * SRS FR7: Auto-retry / rollback.
 *
 * @param {number} retryCount
 * @returns {object} { shouldRetry, shouldRollback, message }
 */
export function evaluateDeployRetry(retryCount) {
  if (retryCount < MAX_DEPLOY_RETRIES) {
    return {
      shouldRetry:    true,
      shouldRollback: false,
      message:        `Retrying deployment (attempt ${retryCount + 1}/${MAX_DEPLOY_RETRIES})...`,
    };
  }
  return {
    shouldRetry:    false,
    shouldRollback: true,
    message:        `Max deploy retries reached (${MAX_DEPLOY_RETRIES}). Initiating rollback.`,
  };
}
