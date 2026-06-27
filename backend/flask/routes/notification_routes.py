from flask import Blueprint
from middleware.auth_middleware import token_required
from controllers.notification_controller import (
    get_notifications_controller,
    post_notifications_controller
)

notification_bp = Blueprint("notification", __name__)

# v2 REST endpoints (protected)
notification_bp.add_url_rule("/notifications", view_func=token_required(get_notifications_controller), methods=["GET"])
notification_bp.add_url_rule("/notifications/send", view_func=token_required(post_notifications_controller), methods=["POST"])
