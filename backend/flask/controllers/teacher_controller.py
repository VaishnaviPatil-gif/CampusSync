from flask import request, jsonify, g
from services.teacher_service import TeacherService

def get_teacher_students_controller():
    email = g.user["email"]
    students = TeacherService.get_classroom_students(email)
    return jsonify({"success": True, "data": students}), 200

def get_teacher_assignments_controller():
    email = g.user["email"]
    assignments = TeacherService.get_assignments(email)
    return jsonify({"success": True, "data": assignments}), 200

def post_teacher_assignment_controller():
    email = g.user["email"]
    data = request.get_json(silent=True) or {}
    
    required = ["title", "dueDate"]
    for field in required:
        if not data.get(field):
            return jsonify({"success": False, "error": {"code": 400, "message": f"{field} is required"}}), 400
            
    res = TeacherService.create_assignment(email, data)
    if not res:
        return jsonify({"success": False, "error": {"code": 404, "message": "Teacher not found"}}), 404
    return jsonify({"success": True, "data": res}), 201

def put_teacher_assignment_controller(id):
    email = g.user["email"]
    data = request.get_json(silent=True) or {}
    
    success = TeacherService.update_assignment(email, int(id), data)
    if not success:
        return jsonify({"success": False, "error": {"code": 404, "message": "Assignment not found or unauthorized"}}), 404
    return jsonify({"success": True, "message": "Assignment updated successfully"}), 200

def delete_teacher_assignment_controller(id):
    email = g.user["email"]
    
    success = TeacherService.delete_assignment(email, int(id))
    if not success:
        return jsonify({"success": False, "error": {"code": 404, "message": "Assignment not found or unauthorized"}}), 404
    return jsonify({"success": True, "message": "Assignment deleted successfully"}), 200
