# CampusSync (Student360)

> **An AI-powered Educational Risk Monitoring Platform** that enables institutions to proactively monitor student attendance, academic performance, wellness, and communication through dedicated dashboards for **Students, Teachers, and Parents**.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Flask](https://img.shields.io/badge/Flask-Python-000000?logo=flask)
![Express](https://img.shields.io/badge/Express.js-Node.js-339933?logo=express)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite)
![License](https://img.shields.io/badge/License-MIT-green)

---

# Overview

CampusSync (Student360) is a full-stack educational platform that helps schools and colleges monitor academic progress, student wellness, and classroom communication in one centralized system.

The platform combines:

* 📚 Academic Management
* 📈 Attendance Analytics
* 😊 Mood & Wellness Tracking
* 📝 Assignment Management
* 🤖 Telegram Notifications
* ❤️ IoT Sensor Monitoring

Unlike traditional student management systems, CampusSync focuses on **early identification of academically or emotionally at-risk students**, allowing teachers and parents to intervene proactively.

---

# Features

## Student Portal

* Personalized Dashboard
* Attendance Analytics
* Attendance Percentage Calculator
* Assignment Tracker
* Daily Mood Tracking
* AI Journal (SARTHI AI Support)
* Daily Wellness Exercises
* IoT Health Monitoring Dashboard
* Academic Performance Insights

---

## Teacher Portal

* Teacher Dashboard
* Student Management
* Attendance Monitoring
* Assignment CRUD
* Student Analytics
* Parent Communication
* Student Profile Management

---

## Parent Portal

* Child Progress Dashboard
* Attendance Reports
* Assignment Overview
* Wellness Monitoring
* Teacher Communication
* Telegram Notifications

---

## Smart Notification System

* Telegram Bot Integration
* Attendance Alerts
* Assignment Reminders
* Wellness Notifications
* Parent Alerts

---

## Authentication & Security

* JWT Authentication
* Role-Based Access Control (RBAC)
* bcrypt Password Hashing
* Protected Routes
* Session Persistence

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

## Backend

### Flask Service

* Authentication
* User Management
* Academic APIs
* SQLite Integration
* JWT Authorization

### Express Service

* Telegram Services
* Notification APIs
* IoT APIs
* Middleware
* Alert Services

## Database

* SQLite

## Development Tools

* Git
* GitHub
* ESLint
* Prettier
* npm

---

# Project Architecture

```text
                React + TypeScript
                      (Vite)
                         │
                 REST API Requests
          ┌──────────────┴──────────────┐
          │                             │
     Flask Backend               Express Backend
(Authentication & APIs)      (Telegram & IoT Services)
          │                             │
          └──────────────┬──────────────┘
                         │
                     SQLite Database
                         │
               Telegram Bot Integration
```

---

# Folder Structure

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
│   ├── requirements.txt
│   └── package.json
│
├── frontend/
│   ├── assets/
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
│   ├── vite.config.ts
│   └── index.html
│
├── PROJECT_ARCHITECTURE.md
├── README.md
└── LICENSE
```

---

# REST API Overview

## Authentication

```
POST /auth/register
POST /auth/login
```

## Student APIs

```
GET  /student/dashboard
GET  /student/attendance
GET  /student/mood
POST /student/journal
```

## Teacher APIs

```
GET    /teacher/students
POST   /teacher/assignments
PUT    /teacher/assignments/:id
DELETE /teacher/assignments/:id
```

## Parent APIs

```
GET /parent/dashboard
```

## IoT APIs

```
POST /api/sensors
GET  /api/sensors/latest
GET  /api/sensors/history
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

Run Flask

```bash
python app.py
```

Run Express

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

Production Build

```bash
npm run build
```

---

# Current Features

* React + TypeScript Migration
* Modular Component Architecture
* Responsive Dashboards
* JWT Authentication
* Flask REST APIs
* Express Microservices
* SQLite Database
* Telegram Notifications
* IoT Sensor Monitoring
* CSS Modules
* Error Boundaries
* Toast Notifications
* React Query Integration

---

# Future Roadmap

* AI-based Student Risk Prediction
* PostgreSQL Migration
* Docker Deployment
* GitHub Actions CI/CD
* Real-Time WebSockets
* Mobile Application
* Admin Dashboard
* Analytics & Reporting
* Cloud Deployment (AWS/Azure)

---

# Contributing

Contributions are welcome.

1. Fork the repository
2. Create a new feature branch
3. Commit your changes
4. Push your branch
5. Open a Pull Request

---
