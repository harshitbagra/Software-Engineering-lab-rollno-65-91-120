# CS 331: Software Engineering Lab
## Assignment 9 — Q2(b): Defect (Bug) Analysis

Since we only tested `BuildManager.js`, all the bugs listed here must be from `BuildManager.js`. While writing tests and looking closely at the code in `BuildManager.js`, I found 3 real bugs. Here they are:

---

### Bug 1: Missing Type Check Crash
*   **Bug ID:** BUG-001
*   **Module:** `BuildManager.js`
*   **Description:** In `validateBuildConfig()`, the code checks if the artifact name is empty using `.trim()`. But it assumes `artifactName` is always text (a string). If a glitch or bad API request sends a number (like `1234`) instead of a string, calling `.trim()` will completely crash the entire program with a `"TypeError"` instead of just returning an error message gracefully.
*   **Steps to reproduce:** Call `validateBuildConfig({ artifactName: 1234, branch: "main", environment: "staging" })`.
*   **Expected vs Actual:** It *should* cleanly return `isValid: false` with an error message, but it *actually* crashes the program completely.
*   **Severity:** **Medium** — It breaks the app instead of handling the bad data smoothly.
*   **Suggested fix:** Add a check to verify it is a string before trimming: `typeof buildConfig.artifactName !== 'string'`.

---

### Bug 2: Case-Sensitive File Extension Bug
*   **Bug ID:** BUG-002
*   **Module:** `BuildManager.js`
*   **Description:** When checking if a file is allowed, the code uses strict `.endsWith()`. This means if someone uploads `app.ZIP` (capital letters), the code rejects it because it only looks for lowercase `.zip`.
*   **Steps to reproduce:** Call `validateBuildConfig({ artifactName: "app.ZIP", branch: "main", environment: "staging" })`.
*   **Expected vs Actual:** It *should* accept it as a valid zip file, but it *actually* throws an error saying "Artifact must be one of: .zip, .jar...".
*   **Severity:** **Medium** — Users might legitimately use uppercase file extensions and get completely blocked from building.
*   **Suggested fix:** Convert the file name to lowercase before checking it. Change it to `buildConfig.artifactName.toLowerCase().endsWith(ext)`.

---

### Bug 3: Time Parser Fails on "Seconds Only"
*   **Bug ID:** BUG-003
*   **Module:** `BuildManager.js`
*   **Description:** The `getAverageBuildDuration()` function uses a regex formula (`/(\d+)m\s*(\d+)?s?/`) which requires the letter 'm' to be present. If a build is super fast and finishes in just `"45s"` (no minutes), the regex fails to match it. The function then returns `0` for that entry and immediately filters it out. So it gets completely skipped in the average calculation.
*   **Steps to reproduce:** Put a duration of `"45s"` into the mock data and call `getAverageBuildDuration()`.
*   **Expected vs Actual:** It *should* count 45 seconds towards the average, but it *actually* returns `0` for that entry which gets filtered out and ignored.
*   **Severity:** **High** — Any build that completes in under 1 minute is silently removed from the calculation. This makes the average build time look higher than it really is.
*   **Suggested fix:** Add a separate check for seconds-only durations. For example: check if the duration matches `/^(\d+)s$/` first, and if it does, use that number directly instead of running the full minutes regex.
