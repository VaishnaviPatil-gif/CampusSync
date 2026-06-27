from flask import request, jsonify, g
from repositories.user_repository import UserRepository
from services.student_service import StudentService

# --- Compatibility Endpoints ---
def get_student_count_controller():
    count = UserRepository.count_by_role("student")
    return jsonify({"count": count}), 200

def get_teacher_count_controller():
    count = UserRepository.count_by_role("teacher")
    return jsonify({"count": count}), 200

def get_students_controller():
    college = request.args.get("college", "").strip()
    rows = UserRepository.get_all_by_role("student")
    
    if college:
        rows = [row for row in rows if row.get("college", "").lower() == college.lower()]
        
    students = []
    for idx, row in enumerate(rows, start=1):
        classes = ["CSE-A", "CSE-B", "CSE-C", "ECE-A", "IT-A", "IT-B"]
        email = row.get("email") or ""
        email_hash = sum(ord(c) for c in email) % len(classes)
        student_class = classes[email_hash]
        
        students.append({
            "id": f"STU{idx:03d}",
            "name": row.get("full_name") or "Unknown",
            "class": student_class,
            "email": email
        })
        
    return jsonify({"success": True, "data": students}), 200

# --- v2 Specification REST Endpoints ---
def get_student_dashboard_controller():
    email = g.user["email"]
    dashboard = StudentService.get_dashboard(email)
    if not dashboard:
        return jsonify({"success": False, "error": {"code": 404, "message": "Student dashboard not found"}}), 404
    return jsonify({"success": True, "data": dashboard}), 200

def get_student_attendance_controller():
    email = g.user["email"]
    history = StudentService.get_attendance(email)
    return jsonify({"success": True, "data": history}), 200

def get_student_mood_controller():
    email = g.user["email"]
    history = StudentService.get_mood(email)
    return jsonify({"success": True, "data": history}), 200

def post_student_mood_controller():
    email = g.user["email"]
    data = request.get_json(silent=True) or {}
    mood = data.get("mood")
    stress_level = data.get("stressLevel")
    
    if not mood or stress_level is None:
        return jsonify({"success": False, "error": {"code": 400, "message": "mood and stressLevel are required"}}), 400
        
    res = StudentService.add_mood_log(email, mood, int(stress_level))
    if not res:
        return jsonify({"success": False, "error": {"code": 404, "message": "Student not found"}}), 404
    return jsonify({"success": True, "data": res}), 201

def get_student_journal_controller():
    email = g.user["email"]
    history = StudentService.get_journal(email)
    return jsonify({"success": True, "data": history}), 200

def post_student_journal_controller():
    email = g.user["email"]
    data = request.get_json(silent=True) or {}
    entry_text = data.get("entryText")
    
    if not entry_text:
        return jsonify({"success": False, "error": {"code": 400, "message": "entryText is required"}}), 400
        
    res = StudentService.add_journal_entry(email, entry_text)
    if not res:
        return jsonify({"success": False, "error": {"code": 404, "message": "Student not found"}}), 404
    return jsonify({"success": True, "data": res}), 201
