from flask import request, jsonify, g
from services.notification_service import NotificationService

def get_notifications_controller():
    # Load for current authenticated user
    user_id = g.user["user_id"]
    notifications = NotificationService.get_notifications(user_id)
    return jsonify({"success": True, "data": notifications}), 200

def post_notifications_controller():
    data = request.get_json(silent=True) or {}
    user_id = data.get("userId")
    title = data.get("title")
    message = data.get("message")
    channel = data.get("channel", "InApp")
    
    if not user_id or not title or not message:
        return jsonify({"success": False, "error": {"code": 400, "message": "userId, title, and message are required"}}), 400
        
    res = NotificationService.create_notification(int(user_id), title, message, channel)
    return jsonify({"success": True, "data": res}), 201
