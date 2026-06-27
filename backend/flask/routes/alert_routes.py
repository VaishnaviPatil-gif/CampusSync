from flask import Blueprint
from controllers.alert_controller import (
    send_alert_to_parent_controller,
    send_alert_controller
)

alert_bp = Blueprint("alert", __name__)

alert_bp.add_url_rule("/alert/parent", view_func=send_alert_to_parent_controller, methods=["POST"])
alert_bp.add_url_rule("/alert", view_func=send_alert_controller, methods=["POST"])
