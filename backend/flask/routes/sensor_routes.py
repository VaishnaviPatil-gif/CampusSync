from flask import Blueprint
from middleware.auth_middleware import token_required
from controllers.sensor_controller import (
    receive_sensor_data_controller,
    get_latest_sensor_data_controller,
    get_sensor_history_controller
)

sensor_bp = Blueprint("sensor", __name__)

# Legacy and IoT intake endpoints
sensor_bp.add_url_rule("", view_func=receive_sensor_data_controller, methods=["POST"])
sensor_bp.add_url_rule("/latest", view_func=get_latest_sensor_data_controller, methods=["GET"])

# v2 REST Specification endpoints with unique endpoint mapping
sensor_bp.add_url_rule("/sensors/latest", endpoint="get_latest_sensor_v2", view_func=token_required(get_latest_sensor_data_controller), methods=["GET"])
sensor_bp.add_url_rule("/sensors/history", view_func=token_required(get_sensor_history_controller), methods=["GET"])
