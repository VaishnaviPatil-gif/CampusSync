# CampusSync

CampusSync is a modern full-stack student management and academic collaboration platform that streamlines communication between students, teachers, and parents. The platform combines real-time academic insights, attendance tracking, wellness monitoring, assignment management, and Telegram notifications through a scalable React + TypeScript frontend and Python/Node.js backend.

---

# Features

## Student Portal

* Interactive student dashboard
* Attendance analytics and attendance calculator
* Mood tracking and wellness monitoring
* AI-powered journal (SARTHI AI Support)
* Daily exercises and activities
* Assignment tracking
* Academic performance insights
* Live IoT sensor dashboard
* Personalized recommendations

---

## Teacher Portal

* Teacher dashboard
* Student management
* Assignment creation and management
* Student performance analytics
* Parent communication center
* Student profile viewer
* Attendance monitoring
* Academic insights

---

## Parent Portal

* Child performance dashboard
* Attendance monitoring
* Assignment overview
* Wellness updates
* Communication with teachers
* Telegram notifications

---

## Smart Notifications

* Telegram Bot integration
* Attendance alerts
* Assignment reminders
* Parent notifications
* Student updates

---

## Authentication

* Role-based login
* Student authentication
* Teacher authentication
* Parent authentication
* Session persistence using Local Storage

---

# Tech Stack

## Frontend

* React 18
* TypeScript
* Vite
* React Router DOM
* TanStack React Query
* CSS Modules
* Context API

---

## Backend

### Python

* Flask
* SQLite

### Node.js

* Express.js
* Telegram Bot API

---

## Database

* SQLite

---

## Development Tools

* Git
* GitHub
* ESLint
* Prettier
* npm

---

# 📂 Project Structure

```text
CampusSync/
│
├── backend/
│   ├── database/
│   ├── app.py
│   ├── server.js
│   ├── telegramService.js
│   ├── requirements.txt
│   └── package.json
│
├── frontend/
│   ├── assets/
│   │   └── images/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   │
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   └── index.html
│
├── PROJECT_ARCHITECTURE.md
├── README.md
├── LICENSE
└── .gitignore
```

---

# ⚙️ System Workflow

```text
User Login
      │
      ▼
React + TypeScript Frontend
      │
      ▼
React Router Navigation
      │
      ▼
REST API Calls
      │
      ├────────► Flask Backend
      │               │
      │               ▼
      │           SQLite Database
      │
      └────────► Express Backend
                      │
                      ▼
              Telegram Bot Service
```

---

# Core Modules

### Student Module

* Dashboard
* Attendance
* Mood Tracker
* Journal
* Exercises
* Assignments

### Teacher Module

* Dashboard
* Students
* Assignments
* Parent Communication
* Teacher Profile

### Parent Module

* Dashboard
* Child Progress
* Attendance
* Notifications

### Shared Modules

* Authentication
* Theme Management
* Notifications
* API Services
* Error Handling
* Toast Messages

---

#  Key Features

* React + TypeScript architecture
* Modular component design
* CSS Modules styling
* Lazy-loaded routes
* Error Boundary support
* Toast notification system
* React Query data fetching
* Responsive dashboards
* Reusable layouts
* Type-safe API layer
* Production-ready project structure

---

# Getting Started

## Backend

```bash
cd backend
pip install -r requirements.txt
npm install
```

Start Flask

```bash
python app.py
```

Start Express

```bash
node server.js
```

---

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Production Build

```bash
npm run build
```

---

# Future Enhancements

* AI-powered student performance prediction
* Cloud database integration
* Real-time WebSocket updates
* Push notifications
* Mobile application
* Admin dashboard
* Role-based permissions
* Analytics dashboard
* Report generation
* Docker deployment


---

## 📄 License

This project is licensed under the MIT License.
