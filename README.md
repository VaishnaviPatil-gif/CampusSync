# CampusSync

A full-stack academic management platform connecting **Students**, **Teachers**, and **Parents** through role-based dashboards, attendance tracking, mood monitoring, IoT sensor integration, and Telegram notifications.

![Tech Stack](https://img.shields.io/badge/React-18-blue?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Flask](https://img.shields.io/badge/Flask-Python-green?logo=flask) ![Express](https://img.shields.io/badge/Express-Node.js-green?logo=express) ![SQLite](https://img.shields.io/badge/Database-SQLite-orange?logo=sqlite) ![License](https://img.shields.io/badge/License-MIT-yellow)

---

## Overview

CampusSync simplifies communication and academic management within educational institutions. Students track attendance and mood, teachers manage assignments and monitor performance, and parents stay informed — all from one unified platform.

Built with a **React + TypeScript** frontend, dual backend services (**Flask** for auth and data, **Express** for Telegram and IoT), and a shared **SQLite** database (designed for easy migration to PostgreSQL).

> **Status:** Active development · Demo deployment coming soon

---

## Screenshots

> _Screenshots and live demo link will be added on first deployment._

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
```

---

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

---

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
```

---

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

```bash
cd backend
pip install -r requirements.txt
npm install
```

Start the Flask server:
```bash
python app.py
```

Start the Express server (separate terminal):
```bash
node server.js
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

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
| 🔄 | Deployment (Vercel + Render) |
| 🔄 | AI student performance prediction |
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

---

## Author

**Vaishnavi Patil** · [GitHub](https://github.com/VaishnaviPatil-gif)
