# CampusSync (Student360) — Educational Risk Monitoring Platform

A full-stack academic management platform connecting **Students**, **Teachers**, and **Parents** through role-based dashboards, attendance tracking, mood monitoring, IoT sensor integration, and Telegram notifications.

![Tech Stack](https://img.shields.io/badge/React-18-blue?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Flask](https://img.shields.io/badge/Flask-Python-green?logo=flask) ![Express](https://img.shields.io/badge/Express-Node.js-green?logo=express) ![SQLite](https://img.shields.io/badge/Database-SQLite-orange?logo=sqlite) ![License](https://img.shields.io/badge/License-MIT-yellow)

---

## Overview

CampusSync simplifies communication and academic management within educational institutions. Students track attendance and mood, teachers manage assignments and monitor performance, and parents stay informed — all from one unified platform.

Built with a **React + TypeScript** frontend, dual backend services (**Flask** for auth and data, **Express** for Telegram and IoT), and a shared **SQLite** database (designed for easy migration to PostgreSQL).

---

## Features

### Student Portal
- Attendance analytics with percentage calculator
- Assignment tracking and performance insights
- Daily mood tracker and wellness monitoring
- AI-powered journaling (SARTHI AI Support)
- Daily exercises and activity suggestions
- Live IoT sensor monitoring dashboard

### Teacher Portal
- Student management and performance analytics
- Assignment creation, editing, and deletion
- Attendance monitoring per class
- Parent communication center

### Parent Portal
- Child's academic performance overview
- Attendance and assignment visibility
- Wellness updates
- Telegram-based notifications

### Platform-Wide
- Role-based login (Student / Teacher / Parent)
- JWT authentication with bcrypt password hashing
- Telegram bot for alerts and reminders
- IoT sensor data ingestion and history
- Toast notification system and error boundaries

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, React Router DOM |
| State / Data | TanStack React Query, Context API |
| Styling | CSS Modules |
| Backend (Auth & DB) | Python, Flask, SQLite |
| Backend (Services) | Node.js, Express.js |
| Notifications | Telegram Bot API |
| Security | JWT, bcrypt, Helmet, Express Rate Limiting |
| Dev Tools | ESLint, Prettier, Git |

---

## Project Structure

```
CampusSync/
├── backend/
│   ├── database/
│   ├── express/
│   ├── flask/
│   ├── shared/
│   ├── app.py              # Flask entry point
│   ├── server.js           # Express entry point
│   ├── telegramService.js
│   ├── package.json
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── PROJECT_ARCHITECTURE.md
├── README.md
└── LICENSE
=======
CampusSync is a production-grade, full-stack educational risk-monitoring and alert platform. It aggregates academic performance, attendance trends, and real-time student wellness logs (moods and journal entries) into an early-warning dashboard to surface at-risk students before dropout occurs.

The system utilizes a **distributed dual-backend architecture** (Flask + Express as independent services) sharing a persistent database layer, and a modern **React + TypeScript** client-side dashboard powered by **TanStack Query** for robust state synchronization.

---

## 🚀 Key Features

### 👤 Student Portal
* **Interactive Dashboard:** Live insights into academic status, attendance rates, and vitals tracking.
* **Wellness Logging:** Real-time mood check-ins and journal entries to capture mental health anomalies.
* **Attendance Calculator:** Self-tracking tools enabling students to calculate and project attendance targets.
* **Exercises & Recommendations:** Curated daily health challenges and suggestions based on mood metrics.

### 👩‍🏫 Teacher Portal
* **Student Monitoring & Risk Dashboard:** Interactive visual list of enrolled students showcasing attendance levels, stress trends, and flagged risk anomalies.
* **Assignment Management:** High-performance REST interface for creating, modifying, and deleting class assignments.
* **Communication Hub:** One-click integration triggers to message parents immediately regarding attendance drops or mood abnormalities.

### 👨‍👩‍👦 Parent Portal
* **Real-time Status Feed:** Access to real-time attendance, pending coursework, and wellness status.
* **Direct Notifications:** Asynchronous alerting pathways ensuring parents stay updated outside the browser environment.

---

## 🛠️ Technology Stack

### Frontend Client
* **React 18 & TypeScript:** Built with Vite for instant server reload and type safety.
* **TanStack Query (React Query):** Handles cache state management, background querying, and endpoint synchronization.
* **React Router DOM v6:** Route-based code-splitting utilizing `lazy()` and `<Suspense />` for fast page responses.
* **Vanilla CSS Modules:** Modular CSS files for isolated styling and rich visual layouts.

### Backend Infrastructure
* **Python (Flask):** Serves core transactional routing, user management, and authorization services. Utilizes the **Repository Pattern** to cleanly decouple DB queries from business logic.
* **Node.js (Express.js):** Handles alert ingestion, logging telemetry, and external notifications orchestration.
* **Telegram Bot API:** Dispatches asynchronous notification payloads directly to parent mobile channels.
* **SQLite:** Shared local relational database engine with strict schemas mapping multi-profile user roles.

---

## 📂 Project Structure

```text
CampusSync/
├── backend/
│   ├── database/            # SQLite schemas, setup, and initialization scripts
│   │   ├── schema.sql       # SQL script detailing tables and indices
│   │   └── db_setup.py      # Python DB initialization script
│   ├── express/             # Express.js (Node.js) runtime service
│   │   ├── controllers/     # Payload parsing and route execution
│   │   ├── middleware/      # CORS, Helmet, and error boundaries
│   │   └── routes/          # Express API endpoints mapping
│   ├── flask/               # Flask (Python) runtime service
│   │   ├── controllers/     # Route controller endpoints
│   │   ├── middleware/      # Custom JWT check and Rate Limiting
│   │   ├── repositories/    # Database Repository Pattern implementations
│   │   └── routes/          # Flask blueprints
│   ├── app.py               # Flask main entry runner (Port 5000)
│   ├── server.js            # Express main entry runner (Port 3001)
│   └── requirements.txt     # Python system dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable visual widgets and UI elements
│   │   ├── hooks/           # Custom React hooks (auth, animations, queries)
│   │   ├── layouts/         # Base layout wrappers (MainLayout)
│   │   ├── pages/           # Dashboards (Student, Teacher, Parent)
│   │   ├── services/        # Type-safe API endpoints caller module
│   │   ├── types/           # Global TypeScript interface definitions
│   │   ├── App.tsx          # Main React router config and Query client setup
│   │   └── main.tsx         # Root DOM renderer
│   ├── package.json         # Node manifest and dependencies list
│   └── vite.config.ts       # Vite bundler configurations
│
├── PROJECT_ARCHITECTURE.md  # Detailed architecture walkthrough
└── README.md                # System documentation
>>>>>>> 0b9e113 (docs: update project README)
```

---

<<<<<<< HEAD
## System Architecture

```
          ┌─────────────────────┐
          │   React + Vite      │
          │  TypeScript Client  │
          └──────────┬──────────┘
                     │ REST API
         ┌───────────┴───────────┐
         ▼                       ▼
  Flask Backend           Express Backend
(Auth, DB, RBAC)     (Telegram, IoT Services)
         │                       │
         └───────────┬───────────┘
                     ▼
               SQLite Database
                     │
                     ▼
           Telegram Bot Service

```

## REST API Overview

```
# Authentication
POST   /auth/register
POST   /auth/login

# Student
GET    /student/dashboard
GET    /student/attendance
GET    /student/mood
POST   /student/journal

# Teacher
GET    /teacher/students
POST   /teacher/assignments
PUT    /teacher/assignments/:id
DELETE /teacher/assignments/:id

# Parent
GET    /parent/dashboard

# IoT Sensors
POST   /api/sensors
GET    /api/sensors/latest
GET    /api/sensors/history

# Notifications
POST   /alerts/send
GET    /notifications
=======
## ⚙️ Data Flow & System Workflow

```text
                  +---------------------------+
                  | React Router Client (Vite)|
                  +-------------+-------------+
                                |
                   JSON Fetch   |   JSON Fetch
                 +--------------+--------------+
                 |                             |
                 v                             v
     +-----------+-----------+     +-----------+-----------+
     | Flask Backend (Port 5000) | | Express Backend (3001) |
     +-----------+-----------+     +-----------+-----------+
                 |                             |
                 | Write / Read                | Asynchronous Alert
                 v                             v
         [( SQLite DB )]              [[ Telegram Bot API ]]
                 ^                             |
                 |                             v
                 +----------------------- Parents / Chat ID
>>>>>>> 0b9e113 (docs: update project README)
```

---

<<<<<<< HEAD
## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm

### 1. Clone the repository

```bash
git clone https://github.com/VaishnaviPatil-gif/CampusSync.git
cd CampusSync
```

### 2. Backend setup
=======
## 🔑 REST API Interface Specification

| Endpoint | Method | Service | Access Level | Purpose |
|---|---|---|---|---|
| `/api/auth/register` | `POST` | Flask | Public | Registers a new account (Student/Teacher/Parent) |
| `/api/auth/login` | `POST` | Flask | Public | Authenticates credentials, returns signed JWT |
| `/api/student/dashboard` | `GET` | Flask | Student | Fetches real-time academic, attendance & wellness KPIs |
| `/api/teacher/students` | `GET` | Express | Teacher | Lists students, showing historical stress logs & risk values |
| `/api/teacher/assignments`| `POST`/`GET` | Express | Teacher | Manages tasks and posts assignments to specific classes |
| `/api/parent/dashboard` | `GET` | Flask | Parent | Monitors academic performance and alerts for child |
| `/api/sensors/latest` | `GET` | Express | Authenticated | Fetches latest vital values (Heart Rate, Stress Index) |

---

## 🚀 Installation & Local Setup

### Prerequisite Environment
Create a `.env` file in the `backend/` directory:
```env
FLASK_SECRET_KEY=replace-with-a-long-random-secret
TELEGRAM_BOT_TOKEN=replace-with-telegram-bot-token
TELEGRAM_DEFAULT_CHAT_ID=replace-with-telegram-chat-id
EXPRESS_PORT=3001
FLASK_PORT=5000
```
>>>>>>> 0b9e113 (docs: update project README)

### 1. Database Setup
To initialize and populate the SQLite database schema with starting mock tables and relationships, run:
```bash
# Navigate to the backend folder
cd backend

# Execute database setup script
python database/db_setup.py
```

<<<<<<< HEAD
Start the Flask server:
```bash
python app.py
```

Start the Express server (separate terminal):
```bash
node server.js
```

### 3. Frontend setup
=======
### 2. Launch Backend Services
You will need two terminal windows open to run both independent runtimes locally:

* **Terminal A (Flask API):**
  ```bash
  cd backend
  pip install -r requirements.txt
  python app.py
  ```
* **Terminal B (Express Alerts Service):**
  ```bash
  cd backend
  npm install
  node server.js
  ```
>>>>>>> 0b9e113 (docs: update project README)

### 3. Launch Frontend Client
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
<<<<<<< HEAD

The app will be available at `http://localhost:5173`.

### 4. Production build

```bash
cd frontend
npm run build
```

---

## Database

CampusSync currently uses **SQLite** for development and demo purposes. The schema is designed to be portable — migrating to PostgreSQL requires only updating the connection string and swapping the SQLAlchemy dialect.

---

## Roadmap

| Status | Feature |
|---|---|
| ✅ | React + TypeScript frontend |
| ✅ | Flask authentication and database layer |
| ✅ | Express service layer |
| ✅ | SQLite integration |
| ✅ | Telegram bot notifications |
| ✅ | IoT sensor support |
| 🔄 | Real-time WebSocket updates |
| 🔄 | Docker containerization |
| 🔄 | PostgreSQL migration |
| 🔄 | Mobile application |
| 🔄 | Admin dashboard |

---

## Contributing

Contributions, suggestions, and improvements are welcome.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the [MIT License](LICENSE).

=======
Open your browser and navigate to `http://localhost:5173`.

---

## 🛡️ Production Optimizations & Best Practices
* **Middleware Integrity:** Configured Express API with `Helmet` (header security checks) and CORS validations.
* **Rate Limiting:** Added a custom sliding-window request throttling filter in the Flask pipeline to prevent API brute-forcing.
* **Code Splitting:** React routes use `React.lazy()` boundaries, minimizing visual layout shift and lowering initial bundle payloads for mobile networks.
* **State Caching:** TanStack Query prevents duplicate fetch cascades, maintaining cached data models client-side with configurable `staleTime` validation boundaries.

---

