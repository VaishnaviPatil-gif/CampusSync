# CampusSync

CampusSync is a full-stack student management and academic collaboration platform designed to improve communication between students, teachers, and parents through attendance tracking, assignments, mood monitoring, dashboards, and Telegram-based notifications.

---

## Features

### Student Dashboard

* Attendance tracking
* Mood monitoring
* Daily journal system
* Exercises and activities
* Academic insights

### Teacher Dashboard

* Student management
* Assignment tracking
* Attendance control
* Parent communication
* Student performance monitoring

### Parent Portal

* Student activity overview
* Attendance visibility
* Performance updates
* Communication support

### Telegram Integration

* Automated alerts
* Notifications
* Parent-teacher updates
* Important reminders

### Authentication System

* Secure login system
* User role separation
* Session handling
* Authentication workflows

---

## Tech Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Flask (Python)
* Node.js
* Express.js

### Database

* SQLite

### Tools and Integrations

* Telegram Bot API
* Git
* GitHub

---

## Project Structure

```bash
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
│   ├── pages/
│   │   ├── attendance.html
│   │   ├── exercises.html
│   │   ├── journal.html
│   │   ├── mood.html
│   │   ├── parent.html
│   │   ├── student.html
│   │   ├── teacher.html
│   │   └── additional pages
│   │
│   └── index.html
│
├── PROJECT_ARCHITECTURE.md
├── README.md
├── .gitignore
└── LICENSE
```

---

## System Workflow

1. Users log into the platform.
2. Frontend pages send requests to backend APIs.
3. Backend services validate and process requests.
4. Database stores and retrieves application data.
5. Telegram services send notifications and alerts.
6. Dashboards update dynamically based on user activity.

---

## Core Modules

* Student Management
* Attendance System
* Assignment Tracking
* Mood Monitoring
* Parent Communication
* Telegram Notifications
* Authentication and Role Management

---

## Architecture

Detailed project architecture and workflow documentation is available in:

```bash
PROJECT_ARCHITECTURE.md
```

---

## Developed By

Vaishnavi Patil

GitHub:
https://github.com/VaishnaviPatil-gif

---

## Future Improvements

* Real-time notifications
* AI-based student analytics
* Cloud database integration
* Enhanced role-based access control
* Improved mobile responsiveness
* Dedicated admin dashboard
