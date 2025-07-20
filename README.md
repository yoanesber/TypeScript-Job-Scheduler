# Batch Job Processor (TypeScript + Sequelize + Node Schedule)

## Overview 

A scalable and maintainable batch job processor built with **TypeScript**, **Sequelize ORM**, and **node-schedule** for cron-based scheduling. Designed for processing large volumes of data with robust logging and support for CSV reporting.

### 📦 Features

- ⏰ Cron-style job scheduling via `node-schedule`
- 🗃️ Sequelize ORM integration for database models
- 🧾 Execution logging with timestamps, status, and failure reasons
- 📤 CSV exporting using `fast-csv`


### 🧾 Database Schema

#### 📄 `batch_jobs` Table

Stores metadata and configuration for each scheduled job.

| Column          | Type        | Description                                |
|-----------------|-------------|--------------------------------------------|
| id              | INTEGER     | Auto-incrementing primary key              |
| jobName         | STRING      | Unique job identifier                      |
| cronExpression  | TEXT        | Cron format string for scheduling          |
| status          | ENUM        | One of: `active`, `inactive`, `paused`     |
| lastRunAt       | DATETIME    | Last execution timestamp                   |
| nextRunAt       | DATETIME    | Scheduled next execution timestamp         |
| createdAt       | DATETIME    | Timestamp when the record was created      |

🔍 **Purpose:**
- Acts as the job registry and configuration center.
- Enables runtime control over job activity (pause/resume/disable).


#### 🧾 `batch_job_logs` Table

Tracks execution history and outcome of each batch job run.

| Column          | Type      | Description                                  |
|-----------------|-----------|----------------------------------------------|
| id              | INTEGER   | Auto-incrementing primary key                |
| jobName         | STRING    | Name of the executed job                     |
| cronExpression  | TEXT      | Cron format string for scheduling            |
| startedAt       | DATETIME  | Execution start time                         |
| finishedAt      | DATETIME  | Execution end time                           |
| status          | STRING    | `running`, `success`, or `failed`            |
| totalProcessed  | INTEGER   | Count of successfully processed records      |
| totalSuccess    | INTEGER   | Count of successful records                  |
| totalFailure    | INTEGER   | Count of failed records                      |
| failureReason   | TEXT      | Error message, if any                        |

🔍 **Purpose:**
- Provides an audit trail for every job run.
- Enables monitoring, debugging, alerting, and analytics.
- Can be used for reprocessing failed jobs or tracking long-running tasks.


### 📤 CSV Exporting

- Built with `fast-csv`
- Supports generating reports from query results or processed data
- Output stored in `exports/` directory with timestamped filenames
- Designed to be reusable across jobs

---

## 🔁 Flow

Below is the high-level flow describing how the Batch Job Processor works — from scheduling to execution logging and optional CSV export:

```text
┌──────────────────────────────────────────────┐
│       [1] Job Scheduler Starts               │
│----------------------------------------------│
│ - Loads all `active` jobs from `batch_jobs`  │
│ - Schedules each job using `cronExpression`  │
└──────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────┐
│       [2] Job Triggered by node-schedule     │
│----------------------------------------------│
│ - Based on `cronExpression`                  │
│ - Creates a new record in `batch_job_logs`   │
│   with status = "running"                    │
└──────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│       [3] Job Execution Begins                               │
│--------------------------------------------------------------│
│ - jobName = "process-transactions":                          │
│     • Fetch pending transactions from `transactions` table   │
│     • Process each transaction:                              │
│         - Update status to "completed"                       │
│                                                              │
│ - jobName = "generate-daily-reports":                        │
│     • Query yesterday's processed data                       │
│     • Generate CSV report using `util/file-exporter.ts`      │
│     • Save report in `exports/` folder                       │
└──────────────────────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────┐
│        [4] Finalize Log Entry                │
│----------------------------------------------│
│ - Update batch_job_logs with:                │
│   - finishedAt = <timestamp>                 │
│   - status = "success" or "failed"           │
│   - totalSuccess, totalFailure               │
│   - failureReason (if any)                   │
└──────────────────────────────────────────────┘
```

---


## 🤖 Tech Stack

This project utilizes a modern **Node.js + TypeScript** stack focused on building a maintainable and efficient batch job processing system.

| **Component**          | **Description**                                                                              |
|------------------------|----------------------------------------------------------------------------------------------|
| Language               | **TypeScript** — statically typed superset of JavaScript for better developer experience     |
| Runtime                | **Node.js** — non-blocking, event-driven runtime environment for scalable backend tasks      |
| Scheduler              | **node-schedule** — cron-like and flexible job scheduler for JavaScript and TypeScript       |
| ORM                    | **Sequelize** — promise-based Node.js ORM for relational databases (e.g., PostgreSQL)        |
| Database               | **PostgreSQL** — reliable and powerful SQL database engine                                   |
| Job Logs               | **batch_job_logs table** — stores execution results                                          |
| Job Registry           | **batch_jobs table** — manages cron expressions and job configuration                        |
| CSV Export             | **fast-csv** — lightweight CSV formatter and parser used for generating reports              |
| Containerization       | **Docker (optional)** — for packaging and running the service in isolated environments       |

---

## 🧱 Architecture Overview

The project follows a modular and layered folder structure for maintainability, scalability, and separation of concerns. Below is a high-level overview of the folder architecture:

```
📁typescript-idempotency-demo/
├── 📁docker/
│   ├── 📁app/                # Dockerfile and setup for Node.js app container
│   └── 📁postgres/           # PostgreSQL Docker setup with init scripts or volumes
├── 📁exports/                # Directory for generated CSV reports
├── 📁logs/                   # Directory for application and HTTP logs
├── 📁migrations/             # Sequelize migrations
├── 📁src/                    # Application source code
│   ├── 📁config/             # Configuration files (DB, environment, Logging, etc.)
│   ├── 📁models/             # Sequelize models representing DB entities
│   ├── 📁services/           # Business logic and service layer
│   └── 📁utils/              # Utility functions (e.g., file export, logging)
├── .env                    # Environment variables for configuration (DB credentials, app settings)
├── .sequelizerc            # Sequelize CLI configuration
├── entrypoint.sh           # Script executed at container startup (wait-for-db, run migrations, start app)
├── package.json            # Node.js project metadata and scripts
├── sequelize.config.js     # Wrapper to load TypeScript Sequelize config via ts-node
├── tsconfig.json           # TypeScript compiler configuration
└── README.md               # Project documentation
```

---

## 🛠️ Installation & Setup  

Follow the instructions below to get the project up and running in your local development environment. You may run it natively or via Docker depending on your preference.  

### ✅ Prerequisites

Make sure the following tools are installed on your system:

| **Tool**                                                    | **Description**                                    |
|-------------------------------------------------------------|----------------------------------------------------|
| [Node.js](https://nodejs.org/)                              | JavaScript runtime environment (v20+)              |
| [npm](https://www.npmjs.com/)                               | Node.js package manager (bundled with Node.js)     |
| [Make](https://www.gnu.org/software/make/)                  | Build automation tool (`make`)                     |
| [PostgreSQL](https://www.postgresql.org/)                   | Relational database system (v14+)                  |
| [Docker](https://www.docker.com/)                           | Containerization platform (optional)               |

### 🔁 Clone the Project  

Clone the repository:  

```bash
git clone https://github.com/yoanesber/TypeScript-Job-Scheduler.git
cd TypeScript-Job-Scheduler
```

### ⚙️ Configure `.env` File  

Set up your **database** and **TypeScript App** configurations by creating a `.env` file in the project root directory:

```properties
# Application Configuration
PORT=4000
# development, production, test
NODE_ENV=development

# Logging Configuration
LOG_LEVEL=info
LOG_DIRECTORY=../../logs

# Postgre Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=P@ssw0rd
DB_NAME=nodejs_demo
DB_DIALECT=postgres
```

### 👤 Create Dedicated PostgreSQL User (Recommended)

For security reasons, it's recommended to avoid using the default postgres superuser. Use the following SQL script to create a dedicated user (`appuser`) and assign permissions:

```sql
-- Create appuser and database
CREATE USER appuser WITH PASSWORD 'app@123';

-- Allow user to connect to database
GRANT CONNECT, TEMP, CREATE ON DATABASE nodejs_demo TO appuser;

-- Grant permissions on public schema
GRANT USAGE, CREATE ON SCHEMA public TO appuser;

-- Grant all permissions on existing tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO appuser;

-- Grant all permissions on sequences (if using SERIAL/BIGSERIAL ids)
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO appuser;

-- Ensure future tables/sequences will be accessible too
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO appuser;

-- Ensure future sequences will be accessible too
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO appuser;
```

Update your `.env` accordingly:
```properties
DB_USER=appuser
DB_PASS=app@123
```

---


## 🚀 Running the Application  

This section provides step-by-step instructions to run the application either **locally** or via **Docker containers**.

- **Notes**:  
  - All commands are defined in the `Makefile`.
  - To run using `make`, ensure that `make` is installed on your system.
  - To run the application in containers, make sure `Docker` is installed and running.
  - Ensure you have `NodeJs` and `npm` installed on your system

### 📦 Install Dependencies

Make sure all dependencies are properly installed:  

```bash
make install
```

### 🔧 Run Locally (Non-containerized)

Ensure PostgreSQL is running locally, then:

```bash
make dev
```

This command will run the application in development mode, listening on port `4000` by default.

### Run Migrations

To create the database schema, run:

```bash
make refresh-migrate-seed
```

This will execute all pending migrations and seed the database with initial data.

### 🐳 Run Using Docker

To build and run all services (PostgreSQL and TypeScript app):

```bash
make docker-up
```

To stop and remove all containers:

```bash
make docker-down
```

- **Notes**:  
  - Before running the application inside Docker, make sure to update your environment variables `.env`
    - Change `DB_HOST=localhost` to `DB_HOST=postgres-server`.

### 🟢 Application is Running

Now your application is accessible at:
```bash
http://localhost:4000
```

---

## 🧪 Testing Scenarios  

This section describes how to test the batch job processor using the provided test scenarios. The tests are designed to validate the core functionality of the batch job processing system, including job scheduling, execution, and logging.

### ✅ Job Scheduling

- **Test Objective**: Verify that jobs can be scheduled correctly.
- **Test Case**: Create a new job with a valid cron expression.
    - Add a job with `cronExpression` set to `0 0 * * *` (daily at midnight).
        ```sql
        INSERT INTO batch_jobs ("jobName", "cronExpression", status) 
        VALUES('other-daily-reports', '0 0 * * *', 'active');
        ```
    - Restart the job scheduler service.

- **Expected Result**: The job should be added to the `batch_jobs` table with the correct `cronExpression` and `status` set to `active`, also the job should be scheduled to run at the specified time with `nextRunAt` set accordingly.
- **Evidence**: Check the `batch_jobs` table for the new entry.  

| id | jobName                  | cronExpression     | status | lastRunAt          | nextRunAt           | createdAt           |
|----|--------------------------|--------------------|--------|--------------------|---------------------|---------------------|
| 1  | other-daily-reports      | 0 0 * * *          | active | [NULL]             | 2025-07-21 00:00:00 | 2025-07-20 15:44:55 |


### 🏃 Job Execution & Logging

- **Test Objective**: Ensure that scheduled jobs are executed as expected.
- **Test Case**: Set up the seeder to run a job that processes transactions or generates reports.
    - Use the existing job `generate-daily-reports` with `cronExpression` set to `0 18 17 * * *`.
    - Wait for the job to trigger based on the cron schedule.
- **Expected Result**: The job should run and update the `lastRunAt` and `nextRunAt` fields accordingly. A new entry should be created in `batch_job_logs`.  
- **Evidence**: Check the `batch_jobs` and `batch_job_logs` tables after execution.  

`batch_jobs` table after execution:  

| id | jobName                  | cronExpression    | Status | lastRunAt           | nextRunAt           | createdAt           |
|----|--------------------------|-------------------|--------|---------------------|---------------------|---------------------|
| 1  | generate-daily-reports   | 0 18 17 * * *     | active | 2025-07-20 17:18:00 | 2025-07-21 17:18:00 | 2025-07-20 17:16:45 |

`batch_job_logs` table after execution:  

| id | jobName                | cronExpression    | startedAt           | finishedAt          | Status   | totalProcessed | totalSuccess  | totalFailure  | failureReason  |
|----|------------------------|-------------------|---------------------|---------------------|----------|----------------|---------------|---------------|----------------|
| 1  | generate-daily-reports | 0 18 17 * * *     | 2025-07-20 17:18:00 | 2025-07-20 17:18:00 | success  | 278            | 278           | 0             | (empty)        |

### 📊 Report Generation

- **Test Objective**: Validate that CSV reports are generated correctly.
- **Test Case**: Run a job that includes CSV export (e.g., daily transaction report).
- **Expected Result**: A timestamped `.csv` file should be created in the `exports/` folder with correctly formatted data.
- **Evidence**: Check the `exports/` directory for the generated CSV file.
    - Example: `exports/daily-report_2025-07-18_2025-07-20T10-18-00-150Z.csv`  
    - **CSV Content**: The CSV should contain headers and data rows corresponding to the processed transactions.  
        ```text
        id,type,amount,status,consumerId,createdAt,updatedAt
        fd4fef84-c14d-4403-9dcc-9706ec05c8c8,debit,1304.00,failed,330d8c6c-9047-4c05-8f3f-f4f737aac70a,Sat Jul 19 2025 20:54:40 GMT+0700 (Western Indonesia Time),Sun Mar 29 2026 12:01:14 GMT+0700 (Western Indonesia Time)
        23bb0a52-b066-472d-b762-1972e0ecd493,debit,6876.00,pending,cd394260-2d93-4dc7-8948-3c40d408f674,Sat Jul 19 2025 19:32:59 GMT+0700 (Western Indonesia Time),Thu Oct 16 2025 16:20:10 GMT+0700 (Western Indonesia Time)
        ...
        ```

### ❌ Failure Handling

- **Test Objective**: Simulate job execution errors to ensure logging and failure states work.  
- **Test Case**: Force an exception within a job (e.g., by add an invalid operation).  
    - Modify the job logic to throw an error intentionally in `services/transaction.service.ts`.
    ```typescript
    if(total % 10 === 0) {
        throw new Error(`Simulated processing error on transaction-id ${transaction.id}`);
    }
    ```
- **Expected Result**: The job log should record the status as `failed` with `failureReason` populated.  
- **Evidence**: Check the `batch_job_logs` table for the failed job entry.  

`batch_job_logs` table after failure:

| id | jobName                | cronExpression    | startedAt           | finishedAt          | Status   | totalProcessed | totalSuccess  | totalFailure  | failureReason  |
|----|------------------------|-------------------|---------------------|---------------------|----------|----------------|---------------|---------------|----------------|
| 1  | process-transactions   | 0 36 17 * * *     | 2025-07-20 17:36:00 | 2025-07-20 17:36:00 | failed   | 10             | 9             | 1             | Simulated processing error on transaction-id 1 |

---
