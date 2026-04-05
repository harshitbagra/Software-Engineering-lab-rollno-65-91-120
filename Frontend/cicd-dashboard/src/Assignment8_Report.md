CS 331 (Software Engineering Lab)

Assignment 8 — Data Access Layer & Testing

⸻

What is the Data Access Layer?

The Data Access Layer (DAL) is the bottom layer of the 3-tier architecture. It is the only layer that directly communicates with the database. No BLL module or UI component interacts with the database directly — all operations are performed through the DAL.

┌─────────────────────────────────┐
│    Presentation Layer (UI)      │
├─────────────────────────────────┤
│   Business Logic Layer (BLL)    │
├─────────────────────────────────┤
│   Data Access Layer (DAL)       │
├─────────────────────────────────┤
│   Database (PostgreSQL/RDS)     │
└─────────────────────────────────┘

In real deployment, DAL connects to PostgreSQL hosted on AWS RDS using connection pooling. In this project, DAL is simulated using JavaScript modules and mock data.

⸻

A1 — Database Design

Database: cicd_db

Tables Created

Table	Purpose
pipelines	Stores pipeline execution details
builds	Stores build results
failures	Stores failure details
recovery_actions	Stores retry and rollback history
recovery_config	Stores recovery settings
reports	Stores report metadata

⸻

A2 — DAL Code Implementation

DAL Structure

src/dal/
├── db.js
├── PipelineDAL.js
└── FailureDAL.js

⸻

Key Functions

PipelineDAL:
	•	insertPipeline()
	•	getAllPipelines()
	•	updatePipelineStatus()

FailureDAL:
	•	insertFailure()
	•	updateFailureStatus()
	•	saveRecoveryConfig()

⸻

Example Flow

User action → BLL validation → DAL operation → Database update → Response to UI

⸻

What is White Box Testing?

White Box Testing verifies internal code logic. Test cases are designed using knowledge of conditions, branches, and internal logic.

⸻

What is Black Box Testing?

Black Box Testing verifies system functionality without knowledge of internal implementation. It focuses on input-output behavior.

⸻

White Box Test Cases Table

Test ID	Module	Function Tested	Input	Expected Output	Result
WB-TC-01	CICDPipeline	validatePipelineTrigger	Valid input	true	PASS
WB-TC-02	CICDPipeline	validatePipelineTrigger	Missing repoUrl	false	PASS
WB-TC-03	FailureAnalyzer	classifyFailure	“connection timeout”	Network Timeout	PASS
WB-TC-04	RecoveryManager	decideRecoveryAction	Network Timeout, retryCount < 3	retry	PASS
WB-TC-05	BuildManager	getBuildSuccessRate	Success, Failed, Success	~66%	PASS

⸻

White Box Test Results

WHITE BOX TESTS
TC1 PASS
TC2 PASS
TC3 PASS
TC4 PASS
TC5 PASS
Total: 5 Passed, 0 Failed

⸻

Black Box Test Cases Table

Test ID	Feature	Input	Expected Output	Result
BB-TC-01	Trigger Pipeline	Valid input	success = true	PASS
BB-TC-02	Trigger Pipeline	Invalid URL	success = false	PASS
BB-TC-03	Filter Pipelines	branch = main	filtered results	PASS
BB-TC-04	Rollback	Invalid build ID	failure	PASS
BB-TC-05	Build Stats	Success, Failed, Success	67%	PASS

⸻

Black Box Test Results

BLACK BOX TESTS
TC1 PASS
TC2 PASS
TC3 PASS
TC4 PASS
TC5 PASS
Total: 5 Passed, 0 Failed

⸻

Comparison: White Box vs Black Box

Aspect	White Box Testing	Black Box Testing
Knowledge	Internal code	No internal code
Focus	Logic	Functionality
Test Cases	5	5
Result	All Passed	All Passed

⸻

Project Structure

src/
├── dal/
├── bll/
├── tests/
│   ├── whitebox.test.js
│   └── blackbox.test.js
├── components/
└── pages/

⸻

Item	Status
DAL implemented	Completed
Database design	Completed
White Box Testing	5 test cases passed
Black Box Testing	5 test cases passed
Overall result	Successful