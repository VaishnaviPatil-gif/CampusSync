from flask import Blueprint
from controllers.auth_controller import signup_controller, login_controller

auth_bp = Blueprint("auth", __name__)

# Legacy compatible routes
auth_bp.add_url_rule("/signup", view_func=signup_controller, methods=["POST"])
auth_bp.add_url_rule("/login", view_func=login_controller, methods=["POST"])

# Production v2 specification REST routes with unique endpoints
auth_bp.add_url_rule("/auth/register", endpoint="register_v2", view_func=signup_controller, methods=["POST"])
auth_bp.add_url_rule("/auth/login", endpoint="login_v2", view_func=login_controller, methods=["POST"])
