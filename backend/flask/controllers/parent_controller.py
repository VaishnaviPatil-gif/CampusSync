from flask import request, jsonify, g
from services.parent_service import ParentService

def get_parent_dashboard_controller():
    email = g.user["email"]
    dashboard = ParentService.get_parent_dashboard(email)
    return jsonify({"success": True, "data": dashboard}), 200
