# CS 331: Software Engineering Lab
## Assignment 9 — Q1(b): Test Cases

**Module:** `BuildManager.js`

Here are 8 test cases designed to check different rules in the BuildManager.

---

### Test Case Table

| Test ID | Test Description | Input Data | Expected Output | Actual Output | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-BM-01** | Check a completely valid build config | `app.jar`, `staging`, `main` | Valid = `true` | Valid = `true` | PASS |
| **TC-BM-02** | Check if it catches an empty artifact name | `""` (empty string) | Valid = `false` and "Name is required" error | Valid = `false` and error shown | PASS |
| **TC-BM-03** | Check if it rejects bad file types like `.exe` | `name: myapp.exe` | Valid = `false` and "Must be one of..." error | Valid = `false` and error shown | PASS |
| **TC-BM-04** | Check if it catches missing environment values | Missing `branch` and `environment` | Valid = `false` with 2 errors | Valid = `false` with 2 errors | PASS |
| **TC-BM-05** | Check the exact size limit (500MB) | `sizeMB = 500` | Valid = `true` | Valid = `true` | PASS |
| **TC-BM-06** | Check just over the size limit (501MB) | `sizeMB = 501` | Valid = `false` | Valid = `false` | PASS |
| **TC-BM-07** | Check if success rate math is correct | 4 passed out of 6 total | Success Rate = `66.7` | Success Rate = `66.7` | PASS |
| **TC-BM-08** | Check that only "success" builds get artifacts | Mock database array | exactly 4 artifacts found (fails are skipped) | 4 artifacts found | PASS |

---
**Note:** The "Actual Output" and "Status" columns were filled in after running the test script in Q2(a).
