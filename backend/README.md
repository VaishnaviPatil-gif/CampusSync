# CampusSync Backend v2 — Production Ready Architecture

This directory houses the backend v2 implementation for CampusSync, an educational risk-monitoring and alert platform.

---

## 1. Folder Structure Documentation

```
backend/
├── database/            # Database storage, schema SQLs, setup and seeding scripts
│   ├── schema.sql       # Database schema (SQLite normalized structure)
│   ├── db_setup.py      # Python initialization and seeding automation
│   └── student360.db    # Active shared SQLite database file
├── express/             # Express.js (Node.js) runtime service
│   ├── server.js        # Main entry point (Port 3001)
│   ├── controllers/     # Controller layer (handles Express request payloads)
│   ├── middleware/      # Middlewares (Helmet, rate-limiting, CORS, authentication, error boundaries)
│   ├── routes/          # Express route mappings
│   ├── services/        # Service layer (dbService connection manager)
│   └── telegram/        # Telegram service integration logic
├── flask/               # Flask (Python) runtime service
│   ├── app.py           # Main entry point (Port 5000)
│   ├── config.py        # Environment loader
│   ├── controllers/     # Controller layer
│   ├── database/        # Flask DB connection helpers
│   ├── middleware/      # JWT validation and custom rate limiter hook
│   ├── repositories/    # Database Repository Pattern implementations
│   ├── routes/          # Flask blueprints configuration
│   ├── services/        # Service layer (business workflows, hashing)
│   └── utils/           # JWT and cryptographic utilities
├── shared/              # Shared schemas and constant definitions
└── .env                 # Environment secrets configuration file
```

---

## 2. Database ER Diagram

The database utilizes SQLite as a common persistence engine shared between Python and Node.js.

```mermaid
erDiagram
    users ||--o| students : "1-to-1 profile"
    users ||--o| teachers : "1-to-1 profile"
    users ||--o| parents : "1-to-1 profile"
    users ||--o{ notifications : "receives"
    
    classes ||--o{ students : "enrolls"
    classes ||--o{ assignments : "classwork"
    
    teachers ||--o{ assignments : "posts"
    
    students ||--o{ attendance : "records"
    students ||--o{ mood_logs : "reports"
    students ||--o{ journal_entries : "writes"
    
    parents ||--o{ relationships : "maps"
    students ||--o{ relationships : "maps"

    users {
        int id PK
        string email UNIQUE
        string password_hash
        string role "student/teacher/parent/admin"
        string created_at
        string updated_at
    }

    classes {
        int id PK
        string name "CSE-A, ECE-A, etc"
        string college
        string created_at
    }

    students {
        int id PK
        int user_id FK
        string full_name
        string college
        int class_id FK
        string created_at
    }

    teachers {
        int id PK
        int user_id FK
        string full_name
        string college
        string subject
        string created_at
    }

    parents {
        int id PK
        int user_id FK
        string full_name
        string college
        string created_at
    }

    relationships {
        int id PK
        int parent_id FK
        int student_id FK
        string relation_type "guardian, etc"
        string telegram_chat_id
    }

    attendance {
        int id PK
        int student_id FK
        string date "YYYY-MM-DD"
        string status "Present/Absent"
        string details
    }

    assignments {
        int id PK
        int class_id FK
        int teacher_id FK
        string subject
        string title
        string description
        string due_date
        string attachment_url
    }

    mood_logs {
        int id PK
        int student_id FK
        string mood "happy/neutral/low/stress"
        int stress_level "0-100"
        string recorded_at
    }

    journal_entries {
        int id PK
        int student_id FK
        string entry_text
        real sentiment_score
        string created_at
    }

    sensor_readings {
        int id PK
        real temperature
        real humidity
        real heart_rate
        real stress_level
        string received_at
    }

    notifications {
        int id PK
        int user_id FK
        string title
        string message
        string status "unread/read"
        string channel "Telegram/InApp"
        string created_at
    }
```

---

## 3. REST API Specifications

Authentication tokens are issued as standard JWT signatures in response headers or body and must be supplied in subsequent requests using the header `Authorization: Bearer <JWT_TOKEN>`.

### Authentication
* **`POST /api/auth/register`**: Creates user login and assigns profiles.
  * *Request*: `{"fullName": "Sanjay", "email": "sanjay@student.local", "password": "password", "confirmPassword": "password", "role": "student", "college": "BRECW"}`
  * *Response*: `{"success": true, "token": "...", "user": {...}}`
* **`POST /api/auth/login`**: Verifies login and returns JWT.
  * *Request*: `{"email": "sanjay@student.local", "password": "password", "role": "student", "college": "BRECW"}`
  * *Response*: `{"success": true, "token": "...", "user": {...}}`

### Student Dashboard (Student Token Required)
* **`GET /api/student/dashboard`**: Fetches KPIs and latest vital parameters.
* **`GET /api/student/attendance`**: Fetches list of chronological daily attendance.
* **`GET /api/student/mood`**: Fetches logs of registered mood inputs.
* **`GET /api/student/journal`**: Fetches logs of student reflections.

### Teacher Portal (Teacher Token Required)
* **`GET /api/teacher/students`**: Fetches students belonging to the teacher's college, alongside attendance percentages and stress triggers.
* **`GET /api/teacher/assignments`**: Fetches teacher's assignments.
* **`POST /api/teacher/assignments`**: Publishes a classroom task.
  * *Request*: `{"className": "CSE-A", "title": "Homework 1", "description": "Solve unit 1 Qs", "dueDate": "2026-07-15"}`
* **`PUT /api/teacher/assignments/:id`**: Modifies a task.
* **`DELETE /api/teacher/assignments/:id`**: Removes a task.

### Parent Portal (Parent Token Required)
* **`GET /api/parent/dashboard`**: Fetches real-time status and alerts summary for parent's children.

### Sensors Telemetry (Token Required)
* **`GET /api/sensors/latest`**: Returns latest vital signs.
* **`GET /api/sensors/history`**: Returns history of logged readings.

### Notifications Logging (Token Required)
* **`GET /api/notifications`**: Returns logged notifications for the user.
* **`POST /api/notifications/send`**: Sends custom notification alert logs.

---

## 4. Deployment Guide

### A. Environment Configuration
Create a `.env` file in the `backend/` directory using the following keys:

```env
FLASK_SECRET_KEY=replace-with-a-long-random-secret
TELEGRAM_BOT_TOKEN=replace-with-telegram-bot-token
TELEGRAM_DEFAULT_CHAT_ID=replace-with-telegram-chat-id
EXPRESS_PORT=3001
FLASK_PORT=5000
```

### B. Database Initialization and Seeding
Run the Python utility to create and seed tables:
```bash
python backend/database/db_setup.py
```

### C. Running Locally
Ensure ports are open and run the wrapper files in the `backend/` directory:

1. **Start the Flask Authentication & Metadata Service (Port 5000)**:
   ```bash
   python backend/app.py
   ```
2. **Start the Express Alerts & Telegram Integration Service (Port 3001)**:
   ```bash
   node backend/server.js
   ```

### D. Production Deployment Options
For scaling in cloud environments:
* Utilize a production WSGI server (e.g. `gunicorn`) to serve the Flask app:
  `gunicorn -w 4 -b 0.0.0.0:5000 flask.app:app`
* Execute the Node.js application under a process supervisor (e.g. `pm2`):
  `pm2 start backend/express/server.js --name "campussync-express"`
* Add an ingress gateway (like NGINX) to dispatch incoming `/api/auth` or `/api/student` pathways directly to their respective instances.
