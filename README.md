# CampusSync

> **A modern full-stack student management and academic collaboration platform that connects Students, Teachers, and Parents through smart dashboards, attendance tracking, wellness monitoring, IoT integration, and Telegram notifications.**

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Flask](https://img.shields.io/badge/Flask-Python-000000?logo=flask)
![Express](https://img.shields.io/badge/Express.js-Node.js-000000?logo=express)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

# 📖 Overview

CampusSync is a **full-stack web application** built to simplify academic management and communication within educational institutions.

The platform enables **Students**, **Teachers**, and **Parents** to interact through dedicated dashboards while providing attendance tracking, assignment management, mood monitoring, AI-assisted wellness support, IoT sensor integration, and Telegram notifications.

The project follows a **modern React + TypeScript frontend** with **Flask** and **Express.js** backend services backed by a shared **SQLite** database.
----

#  Features

## Student Portal

* Interactive Student Dashboard
* Attendance analytics
* Attendance percentage calculator
* Assignment tracking
* Academic performance insights
* Mood tracking
* Wellness monitoring
* AI-powered Journal (SARTHI AI Support)
* Daily exercises & activities
* Live IoT sensor monitoring
* Personalized recommendations

---

##  Teacher Portal

* Teacher Dashboard
* Student management
* Student performance analytics
* Attendance monitoring
* Assignment creation & management
* Parent communication center
* Student profile viewer
* Classroom insights

---

##  Parent Portal

* Child performance dashboard
* Attendance monitoring
* Assignment overview
* Wellness updates
* Communication with teachers
* Telegram notifications

---

## 🤖 Smart Features

* Telegram Bot Integration
* Attendance Alerts
* Assignment Reminders
* Parent Notifications
* Student Activity Updates
* Live IoT Sensor Monitoring
* AI Wellness Assistant

---

##  Authentication

* Role-based Login
* Student Authentication
* Teacher Authentication
* Parent Authentication
* Local Storage Session Persistence
* JWT Authentication (Backend)
* Role-Based Access Control (RBAC)

---

# 🛠 Tech Stack

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
* npm
* ESLint
* Prettier

---

# 📂 Project Structure

```text
CampusSync/
│
├── backend/
│   ├── database/
│   ├── express/
│   ├── flask/
│   ├── shared/
│   ├── app.py
│   ├── server.js
│   ├── telegramService.js
│   ├── package.json
│   └── requirements.txt
│
├── frontend/
│   ├── assets/
│   ├── src/
│   │   ├── assets/
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
│   ├── index.html
│   └── ...
│
├── PROJECT_ARCHITECTURE.md
├── README.md
├── LICENSE
└── .gitignore
```

---

# System Architecture

```text
                  ┌─────────────────────┐
                  │     React + Vite    │
                  │   TypeScript Client │
                  └──────────┬──────────┘
                             │
                    REST API Requests
                             │
          ┌──────────────────┴──────────────────┐
          │                                     │
          ▼                                     ▼
  Flask Backend                         Express Backend
(Authentication, DB)              (Telegram & IoT Services)
          │                                     │
          └──────────────────┬──────────────────┘
                             ▼
                       SQLite Database
                             │
                             ▼
                     Telegram Bot Service
```

---

# Application Workflow

```text
User Login
     │
     ▼
Authentication
     │
     ▼
Dashboard Selection
     │
     ▼
REST API Requests
     │
     ├────────► Flask Services
     │
     ├────────► Express Services
     │
     ▼
SQLite Database
     │
     ▼
Real-time Dashboard Updates
     │
     ▼
Telegram Notifications
```

---

# Core Modules

## Student Module

* Dashboard
* Attendance
* Mood Tracker
* Journal
* Exercises
* Assignments

---

## Teacher Module

* Dashboard
* Students
* Assignments
* Parent Communication
* Teacher Profile

---

## Parent Module

* Dashboard
* Child Progress
* Attendance
* Notifications

---

## Shared Modules

* Authentication
* Theme Management
* API Services
* Notifications
* Error Handling
* Toast Messages

---

# Security

* JWT Authentication
* Password Hashing (bcrypt)
* Role-Based Access Control (RBAC)
* Helmet Security Headers
* Express Rate Limiting
* Secure REST APIs
* Session Management

---

# REST API Overview

## Authentication

```
POST /auth/register
POST /auth/login
```

## Student

```
GET  /student/dashboard
GET  /student/attendance
GET  /student/mood
POST /student/journal
```

## Teacher

```
GET    /teacher/students
POST   /teacher/assignments
PUT    /teacher/assignments/:id
DELETE /teacher/assignments/:id
```

## Parent

```
GET /parent/dashboard
```

## Sensors

```
POST /api/sensors
GET  /api/sensors/latest
GET  /api/sensors/history
```

## Notifications

```
POST /alerts/send
GET  /notifications
```

---

# Getting Started

## Clone Repository

```bash
git clone https://github.com/VaishnaviPatil-gif/CampusSync.git

cd CampusSync
```

---

## Backend Setup

```bash
cd backend

pip install -r requirements.txt

npm install
```

### Start Flask

```bash
python app.py
```

### Start Express

```bash
node server.js
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

## Production Build

```bash
npm run build
```

---

# Key Highlights

* Modern React + TypeScript Architecture
* Modular Component Design
* CSS Modules Styling
* Lazy-loaded Routes
* Error Boundary Support
* Toast Notification System
* React Query Data Fetching
* Reusable Layouts
* Type-safe API Layer
* IoT Sensor Integration
* Telegram Notifications
* Production-ready Folder Structure

---

# Roadmap

* ✅ React + TypeScript Migration
* ✅ Flask Backend
* ✅ Express Backend
* ✅ SQLite Integration
* ✅ Telegram Notifications
* ✅ IoT Sensor Support
* 🔄 AI Student Performance Prediction
* 🔄 Real-time WebSocket Updates
* 🔄 Docker Deployment
* 🔄 Cloud Database Integration
* 🔄 Mobile Application
* 🔄 Admin Dashboard

---

# Contributing

Contributions, suggestions, and improvements are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push to your branch.
5. Open a Pull Request.
