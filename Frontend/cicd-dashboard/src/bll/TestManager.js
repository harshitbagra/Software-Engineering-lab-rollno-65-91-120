// ============================================================
// BLL Module: TestManager.js
// Business Logic Layer — Automated Test Execution & Reporting
// Project: Automated CI/CD Pipeline with Intelligent Failure Recovery
// ============================================================
//
// SRS Reference   : FR3 (Automated Testing — test suite execution + reports)
// Assignment 5    : TestManager hosted as Jenkins Pipeline Stage on EC2
// Assignment 6 UI : Logs.jsx (live log viewer, color-coded output, stage table)
//
// WHAT THIS IS:
//   TestManager handles all test-related business logic.
//   It processes test results, classifies test failures, and
//   generates test reports for the Logs page.
//
// IN REAL DEPLOYMENT (Assignment 5):
//   Runs as a Jenkins pipeline stage. Executes pytest / Jest / JUnit.
//   Stores test reports. Triggers FailureAnalyzer if tests fail.
//
// IN YOUR PROJECT:
//   Logs.jsx calls getTestStages() for the stage breakdown table.
//   The "Simulate Step" button calls simulateTestStep() to append log lines.
// ============================================================

import { logLines, testStages } from '../data/mockData.js';

// ─── BUSINESS RULES ───────────────────────────────────────────────────────────

const MIN_PASS_RATE_THRESHOLD = 80;   // Below this → pipeline fails the test stage
const LOG_LEVELS = ['INFO', 'OK', 'WARN', 'ERROR'];

// Rule: These log level colors are applied in Logs.jsx
const LOG_LEVEL_COLORS = {
  INFO:  'cyan',
  OK:    'green',
  WARN:  'yellow',
  ERROR: 'red',
};

// ─── VALIDATION ───────────────────────────────────────────────────────────────

/**
 * Validates a test result entry before it is logged.
 * SRS FR3: Test suite execution — every result must have stage + status.
 * Business Rule: Log level must be a recognized level.
 *
 * @param {object} testResult - { stage, status, duration, logLevel }
 * @returns {object} { isValid, errors[] }
 */
export function validateTestResult(testResult) {
  const errors = [];

  if (!testResult.stage || testResult.stage.trim() === '') {
    errors.push('Test stage name is required.');
  }

  if (!testResult.status) {
    errors.push('Test status is required.');
  }

  if (testResult.logLevel && !LOG_LEVELS.includes(testResult.logLevel)) {
    errors.push(`Log level must be one of: ${LOG_LEVELS.join(', ')}`);
  }

  return { isValid: errors.length === 0, errors };
}

// ─── BUSINESS LOGIC ───────────────────────────────────────────────────────────

/**
 * Computes test pass rate and determines if pipeline can proceed.
 * SRS FR3: Test suite execution — must meet pass rate threshold.
 * Business Rule: Pass rate below 80% → fail the test stage.
 * Data Transformation: Raw test stage array → pass rate + proceed flag.
 *
 * @returns {object} { passRate, canProceed, passed, failed, total }
 */
export function getTestPassRate() {
  const total  = testStages.length;
  const passed = testStages.filter(t => t.status === 'Passed').length;
  const failed = testStages.filter(t => t.status === 'Failed').length;

  const passRate   = total > 0 ? Math.round((passed / total) * 100) : 0;
  const canProceed = passRate >= MIN_PASS_RATE_THRESHOLD;

  return { passRate, canProceed, passed, failed, total };
}

/**
 * Gets enriched test stage data for Logs.jsx stage breakdown table.
 * SRS FR3: Detailed report generation.
 * Data Transformation: Raw stage records → enriched with status color + duration label.
 *
 * @returns {Array}
 */
export function getTestStages() {
  return testStages.map(stage => ({
    ...stage,
    statusColor: stage.status === 'Passed' ? 'green'
      : stage.status === 'Failed' ? 'red'
      : 'yellow',
    durationLabel: stage.duration ? `${stage.duration}` : 'N/A',
  }));
}

/**
 * Generates a new simulated log line for Logs.jsx "Simulate Step" button.
 * SRS FR3: Real-time log output during test execution.
 * Data Transformation: Current step index → formatted log line object.
 *
 * Business Rule: Log level is determined by step position
 *   (last step can be ERROR to simulate failure).
 *
 * @param {number} stepIndex - current step number (0-based)
 * @returns {object} { timestamp, level, message, color }
 */
export function simulateTestStep(stepIndex) {
  const steps = [
    { level: 'INFO',  message: 'Initializing test runner...' },
    { level: 'INFO',  message: 'Loading test configuration from jest.config.js' },
    { level: 'OK',    message: 'Test suite: auth.test.js — 12/12 passed' },
    { level: 'OK',    message: 'Test suite: pipeline.test.js — 8/8 passed' },
    { level: 'WARN',  message: 'Test suite: deploy.test.js — 6/7 passed (1 skipped)' },
    { level: 'OK',    message: 'Test suite: recovery.test.js — 5/5 passed' },
    { level: 'ERROR', message: 'Test suite: integration.test.js — FAILED (timeout after 30s)' },
    { level: 'INFO',  message: 'Generating test coverage report...' },
    { level: 'OK',    message: 'Coverage: 87.4% — above threshold (80%)' },
    { level: 'INFO',  message: 'Test stage complete. Results saved to /reports/test-results.xml' },
  ];

  const step = steps[stepIndex % steps.length];
  const now  = new Date();

  return {
    timestamp: now.toTimeString().split(' ')[0],
    level:     step.level,
    message:   step.message,
    color:     LOG_LEVEL_COLORS[step.level],
    id:        `log-${Date.now()}-${stepIndex}`,
  };
}

/**
 * Gets all existing log lines enriched with color metadata.
 * Data Transformation: Raw log strings → colored log objects for Logs.jsx terminal.
 *
 * @returns {Array}
 */
export function getEnrichedLogs() {
  return logLines.map((line, index) => ({
    ...line,
    color: LOG_LEVEL_COLORS[line.level] || 'white',
    id:    `log-${index}`,
  }));
}

/**
 * Gets test summary stats for Logs.jsx header.
 * Data Transformation: Stage array → aggregated summary object.
 *
 * @returns {object} { totalTests, passed, failed, passRate, canProceed }
 */
export function getTestSummary() {
  const { passRate, canProceed, passed, failed, total } = getTestPassRate();
  return {
    totalTests: total,
    passed,
    failed,
    passRate: `${passRate}%`,
    canProceed,
    status: canProceed ? 'PASS' : 'FAIL',
  };
}
