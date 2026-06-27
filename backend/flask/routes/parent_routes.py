from flask import Blueprint
from middleware.auth_middleware import token_required, role_required
from controllers.parent_controller import get_parent_dashboard_controller

parent_bp = Blueprint("parent", __name__)

# v2 REST endpoints (protected)
parent_bp.add_url_rule("/parent/dashboard", view_func=token_required(role_required("parent")(get_parent_dashboard_controller)), methods=["GET"])
