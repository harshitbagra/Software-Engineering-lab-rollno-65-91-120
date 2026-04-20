# CS 331: Software Engineering Lab
## Assignment 9 — Q2(a): Test Execution & Evidence

This document proves that the test cases were actually run.

---

### Execution Summary
*   **Test File Ran:** `tests/A9_Execution.test.js`
*   **Command Used:** `node tests/A9_Execution.test.js`
*   **Total Tests:** 8
*   **Passed:** 8
*   **Failed:** 0

---

### Evidence (Terminal Output)

Below is the exact output copied from the VS Code terminal when running the test script.

```text
PS C:\Users\lalli\OneDrive\Desktop\software-lab> node tests/A9_Execution.test.js
========================================
  ASSIGNMENT 9 — BuildManager Tests
========================================

PASS: TC-BM-01: Valid build config with .jar artifact
PASS: TC-BM-02: Empty artifact name should fail
PASS: TC-BM-03: Unsupported artifact extension .exe
PASS: TC-BM-04: Missing environment and branch fields
PASS: TC-BM-05: Artifact size at boundary (500MB)
PASS: TC-BM-06: Artifact size over limit (501MB)
        → successRate: 66.7 alertLevel: critical
PASS: TC-BM-07: Build success rate from mock data
        → artifacts count: 4
PASS: TC-BM-08: Only successful builds have artifacts

========================================
  RESULTS
  Passed: 8
  Failed: 0
  Total: 8
========================================
PS C:\Users\lalli\OneDrive\Desktop\software-lab>
```
