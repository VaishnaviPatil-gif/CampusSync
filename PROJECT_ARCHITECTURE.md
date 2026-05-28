# Student360 Project Architecture

## Overview
Student360 is split into a static frontend and two backend services:

* The frontend serves the landing page and role dashboards.
* The Flask backend handles authentication, SQLite-backed user data, and a lightweight sensor/alert API.
* The Express backend handles IoT-style sensor intake, alert broadcasting, and Telegram integration.

The current structure keeps the UI static and simple while moving stateful work into the backend layer.

## Folder Responsibilities

* `frontend/index.html` is the entry point and landing page.
* `frontend/pages/` contains the role-specific screens for students, teachers, and parents.
* `frontend/assets/images/` stores all local branding and college images.
* `backend/app.py` is the Flask service for auth, SQLite persistence, and sensor endpoints.
* `backend/server.js` is the Node/Express service for alerts, Telegram dispatch, and in-memory student data.
* `backend/telegramService.js` encapsulates Telegram formatting, registration, and outbound delivery.
* `backend/database/` is the natural home for runtime database files and future persistence assets.

## Frontend Flow

The user starts at `frontend/index.html`, chooses a role, signs up or logs in, and is routed to the correct dashboard page under `frontend/pages/`.

The role dashboards are intentionally page-based rather than SPA-based. Each page keeps its own UI state, renders data from the backend, and uses shared asset paths from `frontend/assets/images/`.

Navigation is split into two patterns:

* From the landing page, links go to `pages/*.html`.
* From a page inside `frontend/pages/`, links back to the entry point use `../index.html`.

## Backend Flow

### Flask service (`backend/app.py`)

This service is the authentication and local persistence layer.

Request flow:

1. The frontend submits sign-up or login data as JSON.
2. Flask validates the payload and normalizes role and college values.
3. Sign-up writes a user row into SQLite with a password hash.
4. Login loads the stored row, verifies the password hash, and refreshes the user profile fields.
5. Flask returns a user payload that the frontend stores locally for navigation and dashboard personalization.

It also exposes:

* `GET /health` for service checks.
* `GET /api/latest` for the latest sensor snapshot.
* `GET /api/students/count` and `GET /api/teachers/count` for summary metrics.
* `GET /api/students` for student listings.
* `POST /api/alert` and `POST /api/alert/parent` for alert delivery.

### Express service (`backend/server.js`)

This service is the alert orchestration layer.

Request flow:

1. Sensor or dashboard data arrives at `POST /api` or alert endpoints.
2. The service normalizes the payload and stores the latest state in memory.
3. It records alert history in memory so the UI can confirm dispatch.
4. Telegram delivery is delegated to `telegramService.js`.
5. The API returns structured JSON that the frontend can render immediately.

## Authentication Flow

1. The user starts on the landing page and chooses Student, Teacher, or Parent.
2. Sign-up sends `fullName`, `email`, `password`, `confirmPassword`, `role`, and `college` to Flask.
3. Login sends `email`, `password`, `role`, and `college`.
4. Flask stores the authenticated email in the session and returns a user profile payload.
5. The frontend stores the current user context in `localStorage` and routes to the appropriate dashboard page.

Authentication is currently email/password based, with the session used for server-side continuity and `localStorage` used for frontend page continuity.

## Telegram Integration Flow

Telegram support is implemented through `backend/telegramService.js` and the Express endpoints that call it.

Flow:

1. A user registers a Telegram chat ID through `/api/telegram/register`.
2. The service stores that chat ID in memory keyed by user ID.
3. When an alert is triggered, the backend formats the alert text into a Telegram message.
4. The message is sent to the configured chat ID using the Telegram Bot API.
5. The endpoint returns whether Telegram delivery succeeded so the UI can show delivery status.

If `TELEGRAM_BOT_TOKEN` is missing, the integration remains disabled without breaking the rest of the app.

## Database Usage

SQLite is used for authentication persistence in the Flask service.

The `users` table stores:

* email
* full name
* password hash
* role
* college
* provider
* timestamps

The app also derives class and teacher subject values deterministically so the frontend and backend can stay aligned without duplicating manual assignments.

Alert history and Telegram registrations are currently memory-backed in the Node service. That keeps the implementation lightweight, but those records are not durable across restarts.

## API Request/Response Lifecycle

### Example: login

1. Browser submits credentials to the Flask API.
2. Flask validates the request body.
3. SQLite returns the user record.
4. Flask checks the password hash.
5. Flask returns JSON with a user object.
6. The frontend stores the user context and redirects to the dashboard.

### Example: alert dispatch

1. A dashboard action posts a risk alert payload.
2. The backend normalizes the alert and enriches it with timestamps.
3. Telegram formatting is applied.
4. The alert is sent through the Telegram Bot API.
5. The API responds with success/failure metadata.

## How Frontend Communicates with Backend

The frontend communicates with backend services through JSON `fetch` requests.

It uses that bridge for:

* login and sign-up
* latest sensor data
* student counts and lists
* alert submission
* Telegram registration and test calls

The frontend does not rely on a build step or client framework runtime, so routing and state transfer are handled with URLs, sessions, and `localStorage`.

## Overall System Workflow

1. The user lands on the Student360 home page.
2. They authenticate as a student, teacher, or parent.
3. The backend validates credentials and returns role-specific context.
4. The frontend redirects to the matching dashboard page.
5. Dashboard pages fetch data from the backend and render role-specific views.
6. If a risk or health event is triggered, the alert path pushes notifications to Telegram.
7. The UI shows the updated state while the backend preserves the authoritative data where implemented.

## Maintainability Notes

* Asset paths now resolve from the page location, which makes the refactor safe after moving shared images under `frontend/assets/images/`.
* Dashboard pages remain independently deployable static files.
* Backend responsibilities are separated by runtime and protocol: Flask for auth/persistence, Express for alert dispatch and Telegram.