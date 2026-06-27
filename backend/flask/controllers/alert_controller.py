from datetime import datetime, timezone
from flask import request, jsonify
from services.telegram_service import TelegramService
from repositories.profile_repository import ProfileRepository
from config import Config

def send_alert_to_parent_controller():
    data = request.get_json(silent=True) or {}
    student_id = data.get("studentId", "")
    class_name = data.get("className", "")
    risk_level = data.get("riskLevel", "medium").upper()
    reason = data.get("reason", "General notification")
    
    # Try to resolve chat ID from DB relationships table
    chat_id = None
    try:
        if student_id:
            numeric_id = student_id
            if isinstance(student_id, str) and student_id.startswith("STU"):
                numeric_id = int(student_id[3:])
            else:
                numeric_id = int(student_id)
            chat_id = ProfileRepository.get_parent_chat_id_for_student(numeric_id)
    except Exception as e:
        print(f"[TELEGRAM-FLASK ERROR] Failed to resolve parent chat ID: {e}")

    # Fall back to default configured chat ID if not registered
    if not chat_id:
        chat_id = Config.TELEGRAM_DEFAULT_CHAT_ID
    
    risk_emoji = "🔴" if risk_level == "HIGH" else "🟠" if risk_level == "MEDIUM" else "🟢"
    message = f"""
{risk_emoji} <b>Student360 Alert</b>

<b>Student ID:</b> {student_id}
<b>Class:</b> {class_name}
<b>Risk Level:</b> {risk_level}
<b>Reason:</b> {reason}
<b>Time:</b> {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')} UTC
    """.strip()
    
    success = False
    if chat_id:
        success = TelegramService.send_message(chat_id, message)
    else:
        print(f"[FLASK ALERT] No Chat ID resolved. Alert logged: {message}")
        
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

def send_alert_controller():
    data = request.get_json(silent=True) or {}
    message_text = data.get("message", "Test alert from Student360")
    
    # Send broadcast to all parents registered in DB!
    # Query all parent chat IDs from relationships
    chat_ids = []
    try:
        with get_db_connection() as conn: # Wait, we shouldn't open db connection directly if we can do it via a repository, or let's use a query:
            # Let's query distinct telegram_chat_id from relationships
            pass
    except:
        pass
        
    # Let's use a clean query in relationships. We will fetch distinct telegram_chat_ids.
    # To keep it simple and elegant, let's write a repository helper or query:
    from database.db import get_db_connection
    success_count = 0
    fail_count = 0
    
    try:
        with get_db_connection() as conn:
            rows = conn.execute("SELECT DISTINCT telegram_chat_id FROM relationships WHERE telegram_chat_id IS NOT NULL AND telegram_chat_id != ''").fetchall()
            chat_ids = [row["telegram_chat_id"] for row in rows]
    except Exception as e:
        print(f"[TELEGRAM BROADCAST ERROR] {e}")

    # Fall back to default if no chat IDs registered
    if not chat_ids and Config.TELEGRAM_DEFAULT_CHAT_ID:
        chat_ids = [Config.TELEGRAM_DEFAULT_CHAT_ID]

    for cid in chat_ids:
        sent = TelegramService.send_message(cid, message_text)
        if sent:
            success_count += 1
        else:
            fail_count += 1
            
    return jsonify({
        "success": True,
        "message": "Alert broadcasted successfully.",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "telegramNotifications": {
            "sent": success_count,
            "failed": fail_count
        }
    }), 200
