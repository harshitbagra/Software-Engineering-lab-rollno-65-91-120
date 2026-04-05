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
    toBeTruthy: () => {
      if (!actual) throw new Error(`Expected truthy, got ${actual}`);
    },
    toBeFalsy: () => {
      if (actual) throw new Error(`Expected falsy, got ${actual}`);
    }
  };
}

// ================== PUBLIC FUNCTIONS ==================

function triggerPipeline(data) {
  if (!data.repoUrl || !data.repoUrl.startsWith("https://"))
    return { success: false };

  if (!["main", "dev"].includes(data.branch))
    return { success: false };

  return { success: true, message: "Pipeline triggered" };
}

function filterPipelines(branch) {
  const pipelines = [
    { branch: "main" },
    { branch: "dev" },
    { branch: "main" }
  ];
  if (branch === "all") return pipelines;
  return pipelines.filter(p => p.branch === branch);
}

function rollbackBuild(buildId) {
  if (buildId !== "#101") return { success: false };
  return { success: true };
}

function saveConfig(config) {
  if (parseInt(config.maxRetries) < 1) return { success: false };
  return { success: true };
}

function getBuildStats(builds) {
  let passedCount = builds.filter(b => b === "Success").length;
  return Math.round((passedCount / builds.length) * 100);
}

// ================== TEST CASES ==================

// TC1: Valid pipeline trigger
test("TC1: Valid pipeline trigger", () => {
  const r = triggerPipeline({
    repoUrl: "https://github.com/repo",
    branch: "main"
  });
  expect(r.success).toBeTruthy();
});

// TC2: Invalid pipeline (wrong URL)
test("TC2: Invalid repo URL", () => {
  const r = triggerPipeline({
    repoUrl: "github.com/repo",
    branch: "main"
  });
  expect(r.success).toBeFalsy();
});

// TC3: Filter pipelines by branch
test("TC3: Filter main branch", () => {
  const r = filterPipelines("main");
  expect(r.length).toBe(2);
});

// TC4: Rollback invalid build
test("TC4: Rollback invalid build", () => {
  const r = rollbackBuild("#999");
  expect(r.success).toBeFalsy();
});

// TC5: Build success rate calculation
test("TC5: Build stats calculation", () => {
  const rate = getBuildStats(["Success", "Failed", "Success"]);
  expect(rate).toBe(67);
});

// ================== RESULT ==================

console.log("\nTotal Passed:", passed);
console.log("Total Failed:", failed);