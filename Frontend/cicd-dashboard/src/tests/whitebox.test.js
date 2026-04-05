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
    }
  };
}

// ================== FUNCTIONS ==================

function validatePipelineTrigger(data) {
  if (!data.repoUrl) return false;
  if (!data.branch) return false;
  return true;
}

function classifyFailure(msg) {
  msg = msg.toLowerCase();
  if (msg.includes("test")) return "Test Failure";
  if (msg.includes("timeout")) return "Network Timeout";
  return "Build Error";
}

function decideRecoveryAction({ failureType, retryCount }) {
  if (retryCount >= 3) return "rollback";
  if (failureType === "Network Timeout") return "retry";
  return "escalate";
}

function getBuildSuccessRate(builds) {
  let success = builds.filter(b => b === "Success").length;
  return (success / builds.length) * 100;
}

function insertPipelineDAL(data) {
  if (!data.build) return false;
  return true;
}

// ================== TEST CASES ==================

// TC1: Valid pipeline trigger
test("TC1: Valid pipeline input", () => {
  expect(validatePipelineTrigger({
    repoUrl: "https://github.com/repo",
    branch: "main"
  })).toBe(true);
});

// TC2: Invalid pipeline trigger (missing repo)
test("TC2: Missing repoUrl", () => {
  expect(validatePipelineTrigger({
    branch: "main"
  })).toBe(false);
});

// TC3: Failure classification
test("TC3: Classify timeout error", () => {
  expect(classifyFailure("connection timeout")).toBe("Network Timeout");
});

// TC4: Recovery decision logic
test("TC4: Retry on network failure", () => {
  expect(decideRecoveryAction({
    failureType: "Network Timeout",
    retryCount: 1
  })).toBe("retry");
});

// TC5: Build success rate calculation
test("TC5: Success rate calculation", () => {
  expect(getBuildSuccessRate(["Success", "Failed", "Success"])).toBe(66.66666666666666);
});

// ================== RESULT ==================

console.log("\nTotal Passed:", passed);
console.log("Total Failed:", failed);
