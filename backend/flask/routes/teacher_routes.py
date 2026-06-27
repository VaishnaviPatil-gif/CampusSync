from flask import Blueprint
from middleware.auth_middleware import token_required, role_required
from controllers.teacher_controller import (
    get_teacher_students_controller,
    get_teacher_assignments_controller,
    post_teacher_assignment_controller,
    put_teacher_assignment_controller,
    delete_teacher_assignment_controller
)

teacher_bp = Blueprint("teacher", __name__)

# v2 REST endpoints (protected)
teacher_bp.add_url_rule("/teacher/students", view_func=token_required(role_required("teacher")(get_teacher_students_controller)), methods=["GET"])
teacher_bp.add_url_rule("/teacher/assignments", view_func=token_required(role_required("teacher")(get_teacher_assignments_controller)), methods=["GET"])
teacher_bp.add_url_rule("/teacher/assignments", view_func=token_required(role_required("teacher")(post_teacher_assignment_controller)), methods=["POST"])
teacher_bp.add_url_rule("/teacher/assignments/<int:id>", view_func=token_required(role_required("teacher")(put_teacher_assignment_controller)), methods=["PUT"])
teacher_bp.add_url_rule("/teacher/assignments/<int:id>", view_func=token_required(role_required("teacher")(delete_teacher_assignment_controller)), methods=["DELETE"])
