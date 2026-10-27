# 🎓 Build and Deploy a Student Management Application Using DevOps Tools

An end-to-end Academic DevOps Project featuring a containerized **Student Management Web Application** with automated testing, CI/CD pipeline automation via **Jenkins**, containerization with **Docker**, and orchestration on **Kubernetes**.

---

## 📌 Table of Contents
1. [Project Overview](#-project-overview)
2. [DevOps Architecture](#-devops-architecture)
3. [Technology Stack](#-technology-stack)
4. [Project Directory Structure](#-project-directory-structure)
5. [Phase 1: Local Setup & Verification (Node.js & Tests)](#-phase-1-local-setup--verification)
6. [Phase 2: Version Control (Git & GitHub)](#-phase-2-version-control-git--github)
7. [Phase 3: Continuous Integration (Jenkins Pipeline)](#-phase-3-continuous-integration-jenkins-pipeline)
8. [Phase 4: Containerization (Docker)](#-phase-4-containerization-docker)
9. [Phase 5: Container Orchestration (Kubernetes)](#-phase-5-container-orchestration-kubernetes)
10. [REST API Documentation & Health Endpoint](#-rest-api-documentation)
11. [College Faculty Viva & Interview Questions](#-college-faculty-viva--interview-questions)

---

## 🚀 Project Overview

The objective of this project is to simulate real-world DevOps practices by developing a full-stack student management portal and establishing an automated deployment pipeline. 

### Key Capabilities:
- **Interactive Web Dashboard**: Add, search, filter, update, and delete student records with instant live updates.
- **RESTful API Service**: Built on Express.js with robust JSON persistence and validation.
- **Automated Testing**: 7 comprehensive unit and integration tests using `node:test` and `Supertest`.
- **Automated Health Probes**: `/health` endpoint returning real-time status and uptime.
- **Continuous Integration**: Declarative `Jenkinsfile` running linting, tests, and build checks.
- **Production Containerization**: Multi-layer security Dockerfile using lightweight Alpine Linux and a non-root user.
- **Resilient Cloud Orchestration**: Kubernetes `Deployment` with 2 replicas and a `NodePort` service.

---

## 📐 DevOps Architecture

```
+-----------------------------------------------------------------------------------------+
|                                    DevOps Lifecycle                                     |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|  [ Developer Workspace ]                                                                |
|       |                                                                                 |
|       | 1. Code & Local Unit Tests (node:test + Supertest)                              |
|       v                                                                                 |
|  [ Local Git Repo ] ---> 2. Push ---> [ GitHub Remote Repository ]                      |
|                                                     |                                   |
|                                                     | 3. Webhook / Polling Trigger      |
|                                                     v                                   |
|                                            [ Jenkins CI Pipeline ]                      |
|                                            - Check Environment                          |
|                                            - Install Dependencies (npm ci)              |
|                                            - Run Automated Tests                        |
|                                            - Syntax Check & Code Audit                  |
|                                            - Build Docker Image                         |
|                                                     |                                   |
|                                                     | 4. Package Artifact               |
|                                                     v                                   |
|                                            [ Docker Container ]                         |
|                                            - Node 20 Alpine Linux                       |
|                                            - Non-root user execution                    |
|                                            - Port 3000 & Healthcheck                    |
|                                                     |                                   |
|                                                     | 5. Deploy Manifests                |
|                                                     v                                   |
|                                            [ Kubernetes Cluster ]                       |
|                                            - Deployment (2 Pod Replicas)                |
|                                            - Liveness & Readiness Probes                |
|                                            - NodePort Service (:30080)                  |
|                                                     |                                   |
|                                                     v                                   |
|                                           [ End Users / Faculty ]                       |
|                                            http://localhost:30080                       |
+-----------------------------------------------------------------------------------------+
```

---

## 🧰 Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend** | Node.js (v18+) & Express.js | High-performance RESTful Web API |
| **Frontend** | Semantic HTML5, CSS3, JavaScript | Polished, responsive management portal |
| **Datastore** | Persistent JSON File Storage | Lightweight, file-based data persistence with error handling |
| **Testing** | Node.js native `node:test` & `supertest` | Automated API test assertions |
| **Version Control** | Git & GitHub | Distributed version control and branch management |
| **CI/CD** | Jenkins (Declarative Pipeline) | Automated dependency installation, testing, and packaging |
| **Containerization**| Docker | Consistent, isolated runtime container packaging |
| **Orchestration** | Kubernetes | Replicated pod deployments, health probing, and service exposure |

---

## 📁 Project Directory Structure

```
student-management-devops/
├── data/
│   ├── students.json          # Working persistent JSON datastore
│   └── students.default.json  # Seed template for resetting demo records
├── k8s/
│   ├── deployment.yaml        # Kubernetes Deployment (2 replicas + probes)
│   └── service.yaml           # Kubernetes NodePort Service (Port 30080)
├── public/
│   ├── index.html             # Responsive student dashboard UI
│   ├── css/
│   │   └── style.css          # CSS styling (Cards, Tables, Modals, Toasts)
│   └── js/
│       └── app.js             # Client-side API integration & DOM handling
├── src/
│   ├── app.js                 # Express application & route configuration
│   ├── server.js              # Server entry point & graceful shutdown
│   ├── controllers/
│   │   └── studentController.js # CRUD business logic & validation
│   └── utils/
│       └── fileStorage.js     # Robust JSON async read/write storage engine
├── tests/
│   └── api.test.js            # 7 Automated API test cases
├── .dockerignore              # Excludes unnecessary files from Docker context
├── .gitignore                 # Excludes local modules and test files from Git
├── Dockerfile                 # Production Docker image build definition
├── Jenkinsfile                # Declarative Jenkins CI/CD pipeline
├── package.json               # Project manifest, scripts, and dependencies
├── package-lock.json          # Locked dependency tree
└── README.md                  # Complete project documentation
```

---

## 💻 Phase 1: Local Setup & Verification

Follow these steps in **Windows PowerShell** to test and run the project locally.

### 1.1 Verify Node.js and NPM
Ensure Node.js (version 18 or higher) is installed on your Windows machine:
```powershell
node -v
npm -v
```

### 1.2 Install Project Dependencies
Run `npm install` inside the project folder:
```powershell
cd c:\Users\santh\Downloads\student-management-devops
npm install
```

### 1.3 Run Automated API Tests
Execute the automated test suite using `node:test` and `Supertest`:
```powershell
npm test
```
*Expected Output:*
```text
▶ DevOps Student Management API Test Suite
  ✔ 1. GET /health should return status 200 and report UP status
  ✔ 2. GET /api/students should return status 200 and list student records
  ✔ 3. POST /api/students should create a new student and return 201
  ✔ 4. POST /api/students should reject invalid input with status 400
  ✔ 5. GET /api/students/:id should return 200 for valid ID and 404 for invalid ID
  ✔ 6. PUT /api/students/:id should update student record with status 200
  ✔ 7. DELETE /api/students/:id should remove student and return status 200
✔ DevOps Student Management API Test Suite
ℹ pass 7
ℹ fail 0
```

### 1.4 Start the Web Server
Launch the server in development mode:
```powershell
npm start
```
Open your web browser and navigate to:
- **Dashboard UI**: [http://localhost:3000](http://localhost:3000)
- **Health Check**: [http://localhost:3000/health](http://localhost:3000/health)
- **REST API Data**: [http://localhost:3000/api/students](http://localhost:3000/api/students)

---

## 🐙 Phase 2: Version Control (Git & GitHub)

### 2.1 Install Git on Windows (If Not Installed)
Download and install Git from [https://git-scm.com/download/win](https://git-scm.com/download/win), or install via `winget` in PowerShell:
```powershell
winget install --id Git.Git -e --source winget
```
*Note: Restart your PowerShell terminal or VS Code after installing Git so `git` is recognized.*

### 2.2 Initialize Git Repository & Commit Code
In your project directory, execute:
```powershell
# 1. Initialize local Git repository
git init

# 2. Configure your identity (replace with your details)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# 3. Check status of files
git status

# 4. Stage all project files
git add .

# 5. Commit project files
git commit -m "feat: complete student management devops project with tests, docker, jenkins & k8s"
```

### 2.3 Push to GitHub
1. Log in to [GitHub](https://github.com) and click **New Repository**.
2. Name the repository: `student-management-devops`.
3. Choose **Public** (or Private) and leave README unchecked (since we already have one).
4. Run the following commands in PowerShell (replace `YOUR_USERNAME` with your GitHub username):
```powershell
# Rename branch to main
git branch -M main

# Link remote GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/student-management-devops.git

# Push code to GitHub
git push -u origin main
```

---

## 🏗️ Phase 3: Continuous Integration (Jenkins Pipeline)

### 3.1 Install Jenkins on Windows
1. Download Jenkins Generic Windows Installer or run via Docker:
   ```powershell
   # Option A: Run Jenkins directly inside Docker
   docker run -d --name jenkins -p 8080:8080 -p 50000:50000 -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts
   ```
2. Open [http://localhost:8080](http://localhost:8080) in your browser.
3. Retrieve the initial admin password:
   ```powershell
   docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```
4. Install recommended plugins (**Git Plugin**, **Pipeline**, etc.).

### 3.2 Create the Jenkins Pipeline Job
1. On the Jenkins dashboard, click **New Item**.
2. Enter item name: `student-management-ci`.
3. Select **Pipeline** and click **OK**.
4. Scroll down to the **Pipeline** configuration section:
   - **Definition**: Select `Pipeline script from SCM`.
   - **SCM**: Select `Git`.
   - **Repository URL**: Paste your GitHub URL (e.g. `https://github.com/YOUR_USERNAME/student-management-devops.git`).
   - **Branch Specifier**: `*/main`.
   - **Script Path**: `Jenkinsfile`.
5. Click **Save**.

### 3.3 Trigger the Pipeline
1. Click **Build Now** on the left menu.
2. Watch the pipeline execute through the 6 automated stages:
   - **1. Environment Verification**
   - **2. Install Dependencies**
   - **3. Run Automated Tests**
   - **4. Code Syntax & Quality Check**
   - **5. Docker Image Build**
   - **6. Deployment Smoke Test**
3. Once completed, all stages will display green checkmarks!

---

## 🐳 Phase 4: Containerization (Docker)

### 4.1 Install Docker Desktop
Download and install Docker Desktop for Windows from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/). Ensure WSL 2 backend is selected during installation.

### 4.2 Build the Docker Image
Run the build command in PowerShell inside your project folder:
```powershell
docker build -t student-management-app:latest .
```

### 4.3 Verify the Built Docker Image
```powershell
docker images | Select-String "student-management-app"
```

### 4.4 Run the Docker Container
Launch the container in detached mode mapping host port `3000` to container port `3000`:
```powershell
docker run -d -p 3000:3000 --name student-app-container student-management-app:latest
```

### 4.5 Inspect Running Container & Health Check
```powershell
# Check running containers
docker ps

# Inspect logs
docker logs student-app-container

# Test health check from PowerShell
Invoke-RestMethod -Uri http://localhost:3000/health
```

### 4.6 Stop and Remove the Container (when done)
```powershell
docker stop student-app-container
docker rm student-app-container
```

---

## ☸️ Phase 5: Container Orchestration (Kubernetes)

### 5.1 Enable Kubernetes
You can use any of the following on Windows:
- **Docker Desktop**: Settings ➔ Kubernetes ➔ Check **Enable Kubernetes** ➔ Apply & Restart.
- **Minikube**: Download Minikube and run `minikube start`.

Verify `kubectl` is connected to your cluster:
```powershell
kubectl cluster-info
kubectl get nodes
```

### 5.2 Deploy to Kubernetes
Apply the Deployment and NodePort Service manifests located in the `k8s/` directory:
```powershell
# Apply the Deployment (spins up 2 replica Pods)
kubectl apply -f k8s/deployment.yaml

# Apply the NodePort Service (exposes port 30080)
kubectl apply -f k8s/service.yaml
```

### 5.3 Verify Kubernetes Resources
```powershell
# Check Deployment status
kubectl get deployments

# Check Pods (should show 2 running replicas)
kubectl get pods -l app=student-management

# Check Service details
kubectl get svc student-management-service
```

### 5.4 Access the Application via Kubernetes
- If using **Docker Desktop Kubernetes**:
  Open your browser at: [http://localhost:30080](http://localhost:30080)
- If using **Minikube**, forward the service port or run:
  ```powershell
  minikube service student-management-service --url
  ```
- Alternatively, use `kubectl port-forward`:
  ```powershell
  kubectl port-forward svc/student-management-service 3000:3000
  ```
  Then access [http://localhost:3000](http://localhost:3000).

### 5.5 Test Self-Healing (Fault Tolerance Faculty Demo)
Demonstrate Kubernetes resilience by manually deleting a pod and showing that Kubernetes automatically spawns a new replacement to maintain 2 replicas:
```powershell
# 1. Get current pod name
kubectl get pods

# 2. Delete one pod (replace POD_NAME with actual name)
kubectl delete pod <POD_NAME>

# 3. Observe Kubernetes immediately recreating a replacement pod
kubectl get pods
```

---

## 📡 REST API Documentation

| HTTP Method | Route | Description | Expected Status |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Application health probe for Docker & Kubernetes | `200 OK` |
| `GET` | `/api/students` | Retrieve all student records (supports `?search=`, `?department=`, `?status=`) | `200 OK` |
| `GET` | `/api/students/:id` | Retrieve single student by unique ID | `200 OK` / `404 Not Found` |
| `POST` | `/api/students` | Create new student record with JSON validation | `201 Created` / `400 Bad Request` |
| `PUT` | `/api/students/:id` | Update existing student record | `200 OK` / `404 Not Found` |
| `DELETE` | `/api/students/:id` | Delete student record | `200 OK` / `404 Not Found` |
| `GET` | `/api/stats` | KPI aggregate statistics for dashboard | `200 OK` |
| `POST` | `/api/reset` | Restore demo dataset to default initial records | `200 OK` |

### Sample JSON Student Payload (`POST /api/students`)
```json
{
  "name": "Rohan Verma",
  "rollNumber": "IT2026-003",
  "email": "rohan.verma@college.edu",
  "department": "Information Technology",
  "year": "2nd Year",
  "gpa": 8.75,
  "status": "Active"
}
```

---

## 🎓 College Faculty Viva & Interview Questions

When presenting this project to your college faculty or external examiner, be prepared to answer these common questions:

### Q1: What is DevOps and why is it important in software engineering?
> **Answer**: DevOps is a cultural and technical methodology that bridges software development (**Dev**) and IT operations (**Ops**). It automates and integrates the processes between software development and IT teams, enabling organizations to build, test, and release software faster, more reliably, and with higher quality.

### Q2: What is the purpose of the `/health` endpoint?
> **Answer**: The `/health` endpoint acts as a heartbeat check. It provides real-time status and uptime. In cloud-native systems, Docker `HEALTHCHECK` and Kubernetes `livenessProbe` and `readinessProbe` periodically query `/health` to verify that the application is responsive. If `/health` fails, Kubernetes automatically restarts the pod.

### Q3: Why do we use `node:test` and `Supertest` instead of manual testing?
> **Answer**: Automated testing verifies that API contracts, HTTP response codes, and input validation rules remain intact across changes. In CI/CD pipelines (such as Jenkins), tests run automatically on every commit. If any test fails, the build breaks immediately, preventing defective code from reaching production.

### Q4: Why is running containers as a non-root user a security best practice?
> **Answer**: In our `Dockerfile`, we switch to `USER node`. By default, container processes run as the root user (`UID 0`). If a vulnerability is exploited within the application, a non-root process prevents the attacker from gaining root access to the host machine's kernel or host filesystem.

### Q5: What is the difference between Kubernetes Liveness and Readiness probes?
> **Answer**:
> - **Liveness Probe**: Determines if the container is still running and healthy. If it fails, Kubernetes kills the container and initiates a restart.
> - **Readiness Probe**: Determines if the container is ready to accept user network traffic. If it fails, Kubernetes temporarily isolates the pod from the Service load balancer until it recovers, preventing end-users from seeing HTTP 500 errors.

### Q6: Why did you choose a NodePort Service instead of ClusterIP or LoadBalancer?
> **Answer**: A `ClusterIP` service is only accessible within the internal Kubernetes cluster network. `LoadBalancer` requires an external cloud provider (like AWS ELB, Azure LB, or GCP). `NodePort` exposes the service on a dedicated static port (30080) across all cluster nodes, making it accessible directly in any web browser without requiring a cloud budget.

---

## 🏆 Summary Checklist for Faculty Demonstration

- [x] Local server running and interactive on [http://localhost:3000](http://localhost:3000).
- [x] 7 automated unit and API tests passing with 0 failures (`npm test`).
- [x] Live `/health` endpoint displaying uptime and status.
- [x] Responsive web dashboard with Add, Edit, Delete, Search, and Filter.
- [x] Jenkinsfile defining automated CI stages.
- [x] Production Dockerfile with Alpine Linux and non-root user.
- [x] Kubernetes manifests (`k8s/deployment.yaml` and `k8s/service.yaml`).
- [x] Clear Windows PowerShell commands for every stage.
