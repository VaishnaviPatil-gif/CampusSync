import os
import secrets
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory, session
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.security import check_password_hash, generate_password_hash
import requests

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "student360_auth.db"
load_dotenv(BASE_DIR / ".env")

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", secrets.token_hex(32))
CORS(app, resources={r"/api/*": {"origins": "*"}})


CLASS_OPTIONS = ["CSE-A", "CSE-B", "CSE-C", "ECE-A", "IT-A", "IT-B"]
TEACHER_SUBJECTS = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "English",
    "Computer Science",
    "Electronics",
    "Data Structures",
]


def get_db_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    with get_db_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                full_name TEXT NOT NULL,
                password_hash TEXT,
                role TEXT NOT NULL,
                college TEXT NOT NULL,
                provider TEXT NOT NULL DEFAULT 'local',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        connection.commit()


def normalize_role(role: str) -> str:
    role_value = (role or "").strip().lower()
    if role_value not in {"student", "teacher", "parent"}:
        return ""
    return role_value


def assign_profile(email: str, full_name: str) -> tuple[str, str]:
    seed_text = email or full_name or "student"
    hash_value = 0
    for char in seed_text:
        hash_value = (hash_value * 31 + ord(char)) & 0xFFFFFFFF

    assigned_class = CLASS_OPTIONS[hash_value % len(CLASS_OPTIONS)]
    teacher_subject = TEACHER_SUBJECTS[hash_value % len(TEACHER_SUBJECTS)]
    return assigned_class, teacher_subject


def build_user_payload(email: str, full_name: str, role: str, college: str) -> dict:
    assigned_class, teacher_subject = assign_profile(email, full_name)
    return {
        "email": email,
        "full_name": full_name,
        "role": role,
        "college": college,
        "assigned_class": assigned_class,
        "teacher_subject": teacher_subject,
    }


def validate_signup(data: dict) -> tuple[bool, str]:
    required_fields = ["fullName", "email", "password", "confirmPassword", "role", "college"]
    for field in required_fields:
        if not str(data.get(field, "")).strip():
            return False, f"{field} is required."

    if data["password"] != data["confirmPassword"]:
        return False, "Passwords do not match."

    if len(str(data["password"])) < 6:
        return False, "Password must be at least 6 characters long."

    role = normalize_role(str(data.get("role", "")))
    if not role:
        return False, "Please choose Student, Teacher, or Parent."

    return True, ""


def validate_login(data: dict) -> tuple[bool, str]:
    required_fields = ["email", "password", "role", "college"]
    for field in required_fields:
        if not str(data.get(field, "")).strip():
            return False, f"{field} is required."

    role = normalize_role(str(data.get("role", "")))
    if not role:
        return False, "Please choose Student, Teacher, or Parent."

    return True, ""


@app.post("/api/signup")
def api_signup():
    data = request.get_json(silent=True) or {}
    is_valid, error_message = validate_signup(data)
    if not is_valid:
        return jsonify({"error": error_message}), 400

    email = str(data["email"]).strip().lower()
    full_name = str(data["fullName"]).strip()
    role = normalize_role(str(data["role"]))
    college = str(data["college"]).strip()
    now = datetime.now(timezone.utc).isoformat()

    with get_db_connection() as connection:
        existing = connection.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        if existing:
            return jsonify({"error": "Account already exists. Please Sign In instead."}), 409

        connection.execute(
            """
            INSERT INTO users (email, full_name, password_hash, role, college, provider, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 'local', ?, ?)
            """,
            (email, full_name, generate_password_hash(str(data["password"])), role, college, now, now),
        )
        connection.commit()

    session["student360_email"] = email
    user_payload = build_user_payload(email, full_name, role, college)
    return jsonify({"message": "Account created successfully.", "user": user_payload}), 201


@app.post("/api/login")
def api_login():
    data = request.get_json(silent=True) or {}
    is_valid, error_message = validate_login(data)
    if not is_valid:
        return jsonify({"error": error_message}), 400

    email = str(data["email"]).strip().lower()
    role = normalize_role(str(data["role"]))
    college = str(data["college"]).strip()

    with get_db_connection() as connection:
        row = connection.execute(
            "SELECT email, full_name, password_hash FROM users WHERE email = ?",
            (email,),
        ).fetchone()

    if not row:
        return jsonify({"error": "Account does not exist. Please Sign Up first."}), 404

    if not row["password_hash"]:
        return jsonify({"error": "This account has no password set. Please reset your password or sign up again."}), 400

    if not check_password_hash(row["password_hash"], str(data["password"])):
        return jsonify({"error": "Invalid email or password."}), 401

    session["student360_email"] = email

    with get_db_connection() as connection:
        connection.execute(
            "UPDATE users SET role = ?, college = ?, updated_at = ? WHERE email = ?",
            (role, college, datetime.now(timezone.utc).isoformat(), email),
        )
        connection.commit()

    user_payload = build_user_payload(email, row["full_name"], role, college)
    return jsonify({"message": "Login successful.", "user": user_payload})


@app.get("/health")
def health() -> tuple[dict, int]:
    return {"status": "ok"}, 200


@app.get("/")
def serve_index():
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/<path:asset_path>")
def serve_assets(asset_path: str):
    return send_from_directory(BASE_DIR, asset_path)


import threading
import time

# In-memory storage for latest sensor data
latest_sensor_data = {}
latest_sensor_lock = threading.Lock()

@app.post("/api")
def receive_sensor_data():
    global latest_sensor_data
    data = request.get_json(silent=True) or {}
    
    # Normalize field names from Arduino
    normalized = {
        "temperature": data.get("temperature", data.get("temp")),
        "humidity": data.get("humidity", data.get("hum")),
        "heartRate": data.get("heartRate", data.get("heart_rate", data.get("hr"))),
        "stress": data.get("stress")
    }
    
    # Add timestamp
    normalized["receivedAt"] = datetime.now(timezone.utc).isoformat()
    
    with latest_sensor_lock:
        latest_sensor_data = normalized
    
    print(f"[POST /api] Received sensor data: {normalized}")
    return jsonify({"success": True, "data": normalized}), 200

@app.get("/api/latest")
def get_latest_sensor_data():
    with latest_sensor_lock:
        data = latest_sensor_data.copy() if latest_sensor_data else {}
    
    if not data:
        return jsonify({"temperature": None, "humidity": None, "heartRate": None, "stress": None, "receivedAt": None}), 200
    
    print(f"[GET /api/latest] Returning: {data}")
    return jsonify(data), 200

@app.get("/api/students/count")
def get_student_count():
    with get_db_connection() as connection:
        row = connection.execute("SELECT COUNT(*) as count FROM users WHERE role = 'student'").fetchone()
        count = row["count"] if row else 0
    return jsonify({"count": count}), 200

@app.get("/api/teachers/count")
def get_teacher_count():
    with get_db_connection() as connection:
        row = connection.execute("SELECT COUNT(*) as count FROM users WHERE role = 'teacher'").fetchone()
        count = row["count"] if row else 0
    return jsonify({"count": count}), 200

@app.get("/api/students")
def get_students():
    college = request.args.get("college", "")
    with get_db_connection() as connection:
        rows = connection.execute(
            "SELECT id, email, full_name FROM users WHERE role = 'student' ORDER BY full_name"
        ).fetchall()
    
    # Build student list with proper structure for teacher alerts
    students = []
    for idx, row in enumerate(rows, start=1):
        # Derive class from email hash (same logic as frontend)
        classes = ["CSE-A", "CSE-B", "CSE-C", "ECE-A", "IT-A", "IT-B"]
        email_hash = sum(ord(c) for c in (row["email"] or "")) % len(classes)
        student_class = classes[email_hash]
        
        students.append({
            "id": f"STU{idx:03d}",
            "name": row["full_name"] or "Unknown",
            "class": student_class,
            "email": row["email"]
        })
    
    return jsonify({"success": True, "data": students}), 200

def send_telegram_message(chat_id, message_text):
    """Send a message via Telegram bot"""
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN", "")
    if not bot_token:
        print("[TELEGRAM] No bot token configured")
        return False
    
    try:
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": message_text,
            "parse_mode": "HTML"
        }
        response = requests.post(url, json=payload, timeout=10)
        if response.status_code == 200:
            print(f"[TELEGRAM] Message sent to {chat_id}: {message_text[:50]}...")
            return True
        else:
            print(f"[TELEGRAM] Failed to send: {response.text}")
            return False
    except Exception as error:
        print(f"[TELEGRAM] Error: {error}")
        return False

@app.post("/api/alert/parent")
def send_alert_to_parent():
    data = request.get_json(silent=True) or {}
    student_id = data.get("studentId", "")
    class_name = data.get("className", "")
    risk_level = data.get("riskLevel", "medium").upper()
    reason = data.get("reason", "General notification")
    
    # Get default chat ID (parent/guardian)
    chat_id = os.getenv("TELEGRAM_DEFAULT_CHAT_ID", "")
    
    # Format message for Telegram
    risk_emoji = "🔴" if risk_level == "HIGH" else "🟠" if risk_level == "MEDIUM" else "🟢"
    message = f"""
{risk_emoji} <b>Student360 Alert</b>

<b>Student:</b> {student_id}
<b>Class:</b> {class_name}
<b>Risk Level:</b> {risk_level}
<b>Reason:</b> {reason}
<b>Time:</b> {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')} UTC
    """.strip()
    
    # Send via Telegram if chat_id is configured
    if chat_id:
        success = send_telegram_message(chat_id, message)
    else:
        print(f"[ALERT] No Telegram chat ID configured. Alert: {message}")
        success = False
    
    print(f"[ALERT] Student: {student_id}, Class: {class_name}, Risk: {risk_level}, Reason: {reason}")
    
    return jsonify({
        "success": True,
        "message": "Telegram alert sent to parent successfully." if success else "Alert logged (Telegram not configured).",
        "alert": {
            "studentId": student_id,
            "className": class_name,
            "riskLevel": risk_level,
            "reason": reason,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "telegramSent": success
        }
    }), 200

@app.post("/api/alert")
def send_alert():
    data = request.get_json(silent=True) or {}
    message_text = data.get("message", "Test alert from Student360")
    
    # Get default chat ID
    chat_id = os.getenv("TELEGRAM_DEFAULT_CHAT_ID", "")
    
    # Send via Telegram if configured
    if chat_id:
        success = send_telegram_message(chat_id, message_text)
    else:
        print(f"[ALERT] No Telegram chat ID. Message: {message_text}")
        success = False
    
    return jsonify({
        "success": True,
        "message": "Alert sent successfully." if success else "Alert logged (Telegram not configured).",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "telegramSent": success
    }), 200

if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000, debug=True)
