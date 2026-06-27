from flask import Blueprint
from middleware.auth_middleware import token_required, role_required
from controllers.student_controller import (
    get_student_count_controller,
    get_teacher_count_controller,
    get_students_controller,
    get_student_dashboard_controller,
    get_student_attendance_controller,
    get_student_mood_controller,
    post_student_mood_controller,
    get_student_journal_controller,
    post_student_journal_controller
)

student_bp = Blueprint("student", __name__)

# Legacy compatible endpoints (public)
student_bp.add_url_rule("/students/count", view_func=get_student_count_controller, methods=["GET"])
student_bp.add_url_rule("/teachers/count", view_func=get_teacher_count_controller, methods=["GET"])
student_bp.add_url_rule("/students", view_func=get_students_controller, methods=["GET"])

# v2 REST endpoints (protected)
student_bp.add_url_rule("/student/dashboard", view_func=token_required(role_required("student")(get_student_dashboard_controller)), methods=["GET"])
student_bp.add_url_rule("/student/attendance", view_func=token_required(role_required("student")(get_student_attendance_controller)), methods=["GET"])

student_bp.add_url_rule("/student/mood", view_func=token_required(role_required("student")(get_student_mood_controller)), methods=["GET"])
student_bp.add_url_rule("/student/mood", view_func=token_required(role_required("student")(post_student_mood_controller)), methods=["POST"])

student_bp.add_url_rule("/student/journal", view_func=token_required(role_required("student")(get_student_journal_controller)), methods=["GET"])
student_bp.add_url_rule("/student/journal", view_func=token_required(role_required("student")(post_student_journal_controller)), methods=["POST"])
