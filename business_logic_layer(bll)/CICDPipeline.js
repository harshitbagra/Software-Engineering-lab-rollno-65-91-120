// ============================================================
// BLL Module: CICDPipeline.js
// Business Logic Layer — Main Pipeline Orchestrator
// Project: Automated CI/CD Pipeline with Intelligent Failure Recovery
// ============================================================
//
// SRS Reference   : FR1 (Source Integration), FR2 (Build), FR3 (Testing),
//                   FR4 (Deployment), FR5 (Failure Detection)
// Assignment 5    : CICDPipeline hosted on AWS EC2 (Application Server)
//                   REST API: POST /startPipeline, GET /getStatus
// Assignment 6 UI : App.jsx (RunModal trigger), Dashboard.jsx (stage flow),
//                   Pipelines.jsx (history table)
//
// WHAT THIS IS:
//   CICDPipeline is the MAIN ORCHESTRATOR of the entire system.
//   It coordinates all other modules in sequence:
//   BuildManager → TestManager → DeploymentManager → FailureAnalyzer → RecoveryManager
//
// IN REAL DEPLOYMENT (Assignment 5):
//   This runs as a Python class on AWS EC2.
//   GitHub webhook hits POST /startPipeline → this class executes.
//   Here it is implemented in JavaScript to integrate with the React frontend.
//
// IN YOUR PROJECT:
//   App.jsx calls startPipeline() when user submits RunModal.
//   Dashboard.jsx calls getStatus() to show the live stage flow.
// ============================================================

import { pipelines, pipelineStages, failures } from '../data/mockData.js';

// ─── BUSINESS RULES ───────────────────────────────────────────────────────────

const VALID_BRANCHES    = ['main', 'dev', 'feature/auth', 'feature/ui', 'hotfix', 'hotfix/db'];
const VALID_ENVIRONMENTS = ['production', 'staging', 'development', 'Production', 'Staging', 'Development'];
const PIPELINE_STAGES   = [
  'Code Commit',
  'Fetch Source',
  'Build',
  'Testing',
  'Deploy',
  'Analyze',
  'Recovery',
  'Report',
];
const MAX_NOTE_LENGTH = 100;

// ─── VALIDATION ───────────────────────────────────────────────────────────────

/**
 * Validates pipeline trigger inputs before execution.
 * SRS FR1: Source Integration — must have valid repo + branch.
 * Business Rule: Pipeline cannot start without valid repo URL and approved branch.
 *
 * @param {object} formData - { repoUrl, branch, environment, triggerNote }
 * @returns {object} { isValid, errors[] }
 */
export function validatePipelineTrigger(formData) {
  const errors = [];

  if (!formData.repoUrl || formData.repoUrl.trim() === '') {
    errors.push('Repository URL is required.');
  } else if (!formData.repoUrl.startsWith('https://') && !formData.repoUrl.startsWith('git@')) {
    errors.push('Repository URL must start with https:// or git@');
  }

  if (!formData.branch || !VALID_BRANCHES.includes(formData.branch)) {
    errors.push(`Branch must be one of: ${VALID_BRANCHES.join(', ')}`);
  }

  if (!formData.environment || !VALID_ENVIRONMENTS.includes(formData.environment)) {
    errors.push(`Environment must be one of: ${VALID_ENVIRONMENTS.join(', ')}`);
  }

  if (formData.triggerNote && formData.triggerNote.length > MAX_NOTE_LENGTH) {
    errors.push(`Trigger note must be under ${MAX_NOTE_LENGTH} characters.`);
  }

  return { isValid: errors.length === 0, errors };
}

// ─── REST API SIMULATION ──────────────────────────────────────────────────────

/**
 * POST /startPipeline
 * Simulates the REST API endpoint from Assignment 5.
 * In real deployment: Jenkins on EC2 receives this and starts the pipeline job.
 * In your project: Called by App.jsx when user submits RunModal form.
 *
 * SRS FR1: Automatic trigger via webhooks / manual trigger.
 * Business Rule: Only valid inputs can start a pipeline.
 * Business Rule: New build number is always next sequential number.
 *
 * @param {object} formData - { repoUrl, branch, environment, triggerNote }
 * @returns {object} { success, pipeline, message, errors }
 */
export function startPipeline(formData) {
  // Step 1 — Validate (gate check)
  const validation = validatePipelineTrigger(formData);
  if (!validation.isValid) {
    return { success: false, pipeline: null, message: 'Validation failed.', errors: validation.errors };
  }

  // Step 2 — Generate sequential build number (Data Transformation)
  const lastNum = pipelines.reduce((max, p) => {
    const n = parseInt(p.id.replace('#', ''));
    return n > max ? n : max;
  }, 0);

  // Step 3 — Create new pipeline record
  const newPipeline = {
    id:          `#${lastNum + 1}`,
    branch:      formData.branch,
    commit:      generateCommitHash(),
    trigger:     'Admin',
    status:      'running',
    duration:    '—',
    startedAt:   new Date().toISOString(),
    environment: formData.environment,
    triggerNote: formData.triggerNote || 'Manual trigger',
    stages:      PIPELINE_STAGES.map((s, i) => ({
      name:   s,
      status: i === 0 ? 'Running' : 'Idle',
    })),
  };

  pipelines.unshift(newPipeline);

  return {
    success:  true,
    pipeline: newPipeline,
    message:  `Pipeline ${newPipeline.id} triggered on ${formData.branch}!`,
    errors:   [],
  };
}

/**
 * GET /getStatus
 * Simulates the REST API endpoint from Assignment 5.
 * In real deployment: Frontend polls this to get live pipeline status.
 * In your project: Dashboard.jsx calls this to render the PipelineFlow component.
 *
 * Data Transformation: Raw stage array → enriched objects with position metadata.
 *
 * @param {string|null} buildId - optional specific build, null = latest
 * @returns {object} { pipeline, stages, currentStage, percentComplete }
 */
export function getStatus(buildId = null) {
  const pipeline = buildId
    ? pipelines.find(p => p.id === buildId)
    : pipelines[0];

  if (!pipeline) return { pipeline: null, stages: [], currentStage: null, percentComplete: 0 };

  // Data Transformation: enrich stage objects with position + UI metadata
  const enrichedStages = pipelineStages.map((stage, index) => ({
    ...stage,
    position:     index + 1,
    totalStages:  pipelineStages.length,
    isFirst:      index === 0,
    isLast:       index === pipelineStages.length - 1,
    stageOrder:   PIPELINE_STAGES[index],
  }));

  const runningStage   = enrichedStages.find(s => s.status === 'running' || s.status === 'Running');
  const doneCount      = enrichedStages.filter(s => s.status === 'done' || s.status === 'Done').length;
  const percentComplete = Math.round((doneCount / enrichedStages.length) * 100);

  return { pipeline, stages: enrichedStages, currentStage: runningStage || null, percentComplete };
}

/**
 * Filters pipelines by branch for Pipelines.jsx table.
 * Business Rule: 'all' returns every pipeline unfiltered.
 * Data Transformation: Full array → branch-filtered subset.
 *
 * @param {string} branch
 * @returns {Array}
 */
export function filterPipelinesByBranch(branch) {
  if (!branch || branch === 'all' || branch === 'All Branches') return [...pipelines];
  if (branch === 'feature/*') return pipelines.filter(p => p.branch.startsWith('feature'));
  return pipelines.filter(p => p.branch.toLowerCase().includes(branch.toLowerCase()));
}

/**
 * Retries a failed pipeline.
 * Business Rule: ONLY failed pipelines can be retried.
 * SRS FR7: Auto-retry logic.
 *
 * @param {string} buildId
 * @returns {object} { success, message }
 */
export function retryPipeline(buildId) {
  const pipeline = pipelines.find(p => p.id === buildId);
  if (!pipeline) return { success: false, message: `Pipeline ${buildId} not found.` };
  if (pipeline.status !== 'failed') return { success: false, message: `Pipeline ${buildId} is not failed.` };
  
  pipeline.status   = 'running';
  pipeline.duration = '—';
  
  const failure = failures.find(f => f.build === buildId);
  if (failure) failure.status = 'Resolved';
  
  return { success: true, message: `Retrying pipeline ${buildId}...` };
}

/**
 * Gets KPI stats for Dashboard.jsx StatCards.
 * Data Transformation: Raw array → computed { total, successful, failed, avgDuration }.
 *
 * @returns {object}
 */
export function getPipelineStats() {
  const total      = pipelines.length;
  const successful = pipelines.filter(p => p.status === 'success').length;
  const failed     = pipelines.filter(p => p.status === 'failed').length;
  const running    = pipelines.filter(p => p.status === 'running').length;

  const durations = pipelines
    .filter(p => p.duration && p.duration !== '—')
    .map(p => {
      const m = p.duration.match(/(\d+)m\s*(\d+)?s?/);
      return m ? parseInt(m[1]) * 60 + (parseInt(m[2]) || 0) : 0;
    });

  const avgSec     = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
  const avgDuration = `${Math.floor(avgSec / 60)}m ${avgSec % 60}s`;

  return { total, successful, failed, running, avgDuration };
}

// ─── HELPER ───────────────────────────────────────────────────────────────────
function generateCommitHash() {
  return Math.random().toString(16).substring(2, 9);
}
