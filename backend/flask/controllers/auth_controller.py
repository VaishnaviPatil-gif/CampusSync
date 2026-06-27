from flask import request, jsonify, session
from services.auth_service import AuthService

def signup_controller():
    data = request.get_json(silent=True) or {}
    success, res_data, status_code = AuthService.signup(data)
    if success:
        session["student360_email"] = res_data["user"]["email"]
    return jsonify(res_data), status_code

def login_controller():
    data = request.get_json(silent=True) or {}
    success, res_data, status_code = AuthService.login(data)
    if success:
        session["student360_email"] = res_data["user"]["email"]
    return jsonify(res_data), status_code
