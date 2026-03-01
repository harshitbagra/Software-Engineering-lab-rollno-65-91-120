
# I. Hosting Plan of Application Components

## 1. Host Site (Target Deployment Platform)

| Component | Hosting Location |
|------------|------------------|
| Frontend (Admin Dashboard) | Docker Container on AWS EC2 |
| CICDPipeline | AWS EC2 (Application Server) |
| BuildManager | Jenkins (hosted on EC2) |
| TestManager | Jenkins Pipeline Stage |
| DeploymentManager | Docker on EC2 |
| FailureAnalyzer | Python Backend Service (EC2) |
| RecoveryManager | Backend Service (EC2) |
| ReportGenerator | Backend API (EC2) |
| Database (Logs & Reports) | PostgreSQL (AWS RDS / EC2) |
| VersionControlSystem | GitHub |
| Deployment Platform | Docker Container on EC2 |

---

## 2. Deployment Strategy

### Step 1: Server Configuration
- Launch AWS EC2 instance (Ubuntu)
- Install Docker
- Install Jenkins
- Install Python & required dependencies
- Install PostgreSQL database

### Step 2: Containerization
- Create Dockerfile for backend services
- Create Dockerfile for frontend
- Use Docker Compose to connect services

### Step 3: API Configuration
- Backend exposes REST APIs:
  - `/startPipeline`
  - `/getStatus`
  - `/analyzeFailure`
- Frontend communicates via HTTP requests
- Internal modules interact through Python classes

### Step 4: CI/CD Trigger Setup
- GitHub webhook triggers Jenkins
- Jenkins executes:
  - Build Stage
  - Test Stage
  - Deployment Stage
  - Failure Detection Stage

---

## 3. Security Measures

- Use HTTPS (SSL/TLS encryption)
- Configure AWS Security Groups (Firewall rules)
- Restrict open ports (80, 443, 22 only)
- Apply JWT-based authentication for Admin login
- Encrypt database credentials

---

# II. User Access and System Interaction

## 1. How End Users Access Services

- Admin opens web browser
- Accesses frontend dashboard
- Logs in securely
- Clicks "Start Pipeline"
- Backend API triggers CICDPipeline
- Pipeline performs build, test, deploy
- Status updates displayed on dashboard

---
