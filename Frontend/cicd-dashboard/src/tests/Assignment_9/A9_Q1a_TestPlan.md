# CS 331: Software Engineering Lab
## Assignment 9 — Q1(a): Test Plan

**Project:** CI/CD Dashboard  
**Module being Tested:** `BuildManager.js` (Business Logic Layer)

---

### 1. Objective of Testing
The main goal of this testing is to make sure the `BuildManager` code works correctly. The `BuildManager` handles things like calculating the build success rate, checking if artifact file names are correct, and making sure files aren't too big. We want to test it to find any hidden bugs before it is used in the main project.

### 2. Scope (What we are testing)
We are only testing the following functions inside `BuildManager.js`:
*   `validateBuildConfig()`: Checks if the artifact name and branch are filled correctly.
*   `validateArtifactSize()`: Checks if the file size is under the 500MB limit.
*   `getBuildSuccessRate()`: Calculates the percentage of passed builds.
*   `getArtifacts()`: Gets the list of artifacts but only for successful builds.

**What we are NOT testing:** 
UI components, database, or other files.

### 3. Types of Testing to be Performed
*   **Unit Testing:** We will test each function individually to see if it gives the right output for a given input.
*   **Boundary Testing:** We will test limits, like exactly 500MB and 501MB for file sizes.
*   **Negative Testing:** We will give wrong inputs (like an empty name or `.exe` file) to make sure the system rejects them properly.

### 4. Tools Used
*   **Node.js:** To run the javascript test file.
*   **Custom Test Script:** A simple `test.js` file we wrote to print "PASS" or "FAIL".
*   **VS Code:** To write the code and run the terminal.

### 5. Entry and Exit Criteria
**Entry Criteria (When to start):**
*   The `BuildManager.js` code must be finished.
*   We must have some mock data ready to test with.

**Exit Criteria (When to stop):**
*   All 8 test cases must be run.
*   The results must be logged.
*   We must find and explain at least 3 bugs in the code.
