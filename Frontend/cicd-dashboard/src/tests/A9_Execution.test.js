// ============================================================
// Assignment 9 — Q2(a): Test Execution Script
// Module: BuildManager.js
// Run: node tests/A9_Execution.test.js
// ============================================================

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log("PASS:", name);
    passed++;
  } catch (e) {
    console.log("FAIL:", name, "-", e.message);
    failed++;
  }
}

function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toBeTrue: () => {
      if (actual !== true) throw new Error(`Expected true, got ${actual}`);
    },
    toBeFalse: () => {
      if (actual !== false) throw new Error(`Expected false, got ${actual}`);
    },
    toBeGreaterThan: (n) => {
      if (actual <= n) throw new Error(`Expected ${actual} > ${n}`);
    },
    toBeNull: () => {
      if (actual !== null) throw new Error(`Expected null, got ${actual}`);
    },
    toContain: (str) => {
      if (typeof actual === 'string' && !actual.includes(str)) {
        throw new Error(`Expected string to contain "${str}", got "${actual}"`);
      }
    }
  };
}

// ================= FUNCTIONS (copied from BuildManager.js) =================
// We copy the logic here since the project uses ES module imports
// and the root package.json is type: commonjs

const SUPPORTED_ARTIFACT_TYPES = ['.jar', '.zip', '.tar.gz', '.war', '.docker'];
const MIN_SUCCESS_RATE_THRESHOLD = 85;
const CRITICAL_SUCCESS_RATE = 70;
const MAX_ARTIFACT_SIZE_MB = 500;
const ARTIFACT_RETENTION_DAYS = 30;

function validateBuildConfig(buildConfig) {
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
  if (!buildConfig.branch) errors.push('Target branch is required.');

  return { isValid: errors.length === 0, errors };
}

function validateArtifactSize(sizeMB) {
  if (sizeMB > MAX_ARTIFACT_SIZE_MB) {
    return {
      isValid: false,
      warning: `Artifact size ${sizeMB}MB exceeds limit of ${MAX_ARTIFACT_SIZE_MB}MB. Manual review required.`,
    };
  }
  return { isValid: true, warning: null };
}

// Mock data same as mockData.js
const builds = [
  { id: '#143', artifact: 'myapp-v1.43.zip', status: 'running', date: '2026-03-29', sizeMB: 87,  branch: 'main',         duration: '—'     },
  { id: '#142', artifact: 'myapp-v1.42.zip', status: 'success', date: '2026-03-28', sizeMB: 92,  branch: 'feature/auth', duration: '0m 54s' },
  { id: '#141', artifact: '—',               status: 'failed',  date: '2026-03-27', sizeMB: 0,   branch: 'hotfix/db',    duration: '0m 28s' },
  { id: '#140', artifact: 'myapp-v1.40.zip', status: 'success', date: '2026-03-26', sizeMB: 105, branch: 'main',         duration: '1m 01s' },
  { id: '#139', artifact: 'myapp-v1.39.zip', status: 'success', date: '2026-02-15', sizeMB: 78,  branch: 'dev',          duration: '0m 48s' },
  { id: '#138', artifact: 'myapp-v1.38.zip', status: 'success', date: '2026-02-10', sizeMB: 210, branch: 'main',         duration: '0m 55s' },
];

function getBuildSuccessRate() {
  const total  = builds.length;
  const p = builds.filter(b => b.status === 'success').length;
  const f = builds.filter(b => b.status === 'failed').length;

  const successRate = total > 0 ? Math.round((p / total) * 1000) / 10 : 0;

  let alertLevel = 'ok';
  if (successRate < CRITICAL_SUCCESS_RATE) alertLevel = 'critical';
  else if (successRate < MIN_SUCCESS_RATE_THRESHOLD) alertLevel = 'warning';

  return { successRate, alertLevel, passed: p, failed: f, total };
}

function getArtifacts() {
  return builds
    .filter(b => b.artifact && b.artifact !== '—' && b.status === 'success')
    .map(b => {
      const ageInDays = Math.floor((new Date() - new Date(b.date)) / (1000 * 60 * 60 * 24));
      const retentionStatus = ageInDays > ARTIFACT_RETENTION_DAYS ? 'Archive Pending' : 'Active';
      const sizeCategory = b.sizeMB > 200 ? 'Large' : b.sizeMB > 50 ? 'Medium' : 'Small';

      return {
        build: b.id,
        artifact: b.artifact,
        branch: b.branch,
        date: b.date,
        ageInDays,
        retentionStatus,
        sizeCategory,
        sizeMB: b.sizeMB || 'N/A',
      };
    });
}

function getAverageBuildDuration() {
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

// ================= TEST CASES =================

console.log("========================================");
console.log("  ASSIGNMENT 9 — BuildManager Tests");
console.log("========================================\n");

// TC-BM-01: Valid build config
test("TC-BM-01: Valid build config with .jar artifact", () => {
  const result = validateBuildConfig({
    artifactName: "app-v1.jar",
    environment: "staging",
    branch: "main"
  });
  expect(result.isValid).toBeTrue();
  expect(result.errors.length).toBe(0);
});

// TC-BM-02: Empty artifact name
test("TC-BM-02: Empty artifact name should fail", () => {
  const result = validateBuildConfig({
    artifactName: "",
    environment: "staging",
    branch: "main"
  });
  expect(result.isValid).toBeFalse();
  expect(result.errors.length).toBe(1);
});

// TC-BM-03: Invalid extension (.exe not supported)
test("TC-BM-03: Unsupported artifact extension .exe", () => {
  const result = validateBuildConfig({
    artifactName: "app.exe",
    environment: "staging",
    branch: "main"
  });
  expect(result.isValid).toBeFalse();
  expect(result.errors.length).toBe(1);
});

// TC-BM-04: Missing environment and branch
test("TC-BM-04: Missing environment and branch fields", () => {
  const result = validateBuildConfig({
    artifactName: "deploy.zip"
  });
  expect(result.isValid).toBeFalse();
  expect(result.errors.length).toBe(2);
});

// TC-BM-05: Artifact size exactly at boundary (500MB)
test("TC-BM-05: Artifact size at boundary (500MB)", () => {
  const result = validateArtifactSize(500);
  expect(result.isValid).toBeTrue();
  expect(result.warning).toBeNull();
});

// TC-BM-06: Artifact size exceeding limit (501MB)
test("TC-BM-06: Artifact size over limit (501MB)", () => {
  const result = validateArtifactSize(501);
  expect(result.isValid).toBeFalse();
});

// TC-BM-07: Build success rate calculation
test("TC-BM-07: Build success rate from mock data", () => {
  const stats = getBuildSuccessRate();
  console.log("        → successRate:", stats.successRate, "alertLevel:", stats.alertLevel);
  // 4 success out of 6 total = 66.7%
  expect(stats.successRate).toBe(66.7);
  expect(stats.alertLevel).toBe('critical');
});

// TC-BM-08: Artifacts should only include successful builds
test("TC-BM-08: Only successful builds have artifacts", () => {
  const artifacts = getArtifacts();
  console.log("        → artifacts count:", artifacts.length);
  // should be 4 (builds #142, #140, #139, #138 are success with artifacts)
  expect(artifacts.length).toBe(4);
  // make sure none have failed or running status
  const buildIds = artifacts.map(a => a.build);
  // #143 is running, #141 is failed — neither should appear
  const hasRunning = buildIds.includes('#143');
  const hasFailed = buildIds.includes('#141');
  expect(hasRunning).toBeFalse();
  expect(hasFailed).toBeFalse();
});

// ================= RESULTS =================

console.log("\n========================================");
console.log("  RESULTS");
console.log("  Passed:", passed);
console.log("  Failed:", failed);
console.log("  Total:", passed + failed);
console.log("========================================");
