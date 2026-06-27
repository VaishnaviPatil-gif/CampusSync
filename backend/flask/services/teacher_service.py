from typing import List, Optional
from repositories.profile_repository import ProfileRepository
from repositories.academic_repository import AcademicRepository
from repositories.wellness_repository import WellnessRepository

class TeacherService:
    @staticmethod
    def get_classroom_students(teacher_email: str) -> List[dict]:
        teacher = ProfileRepository.get_teacher_by_email(teacher_email)
        if not teacher:
            return []
            
        college = teacher["college"]
        students = ProfileRepository.get_students_by_college(college)
        
        classroom_students = []
        for s in students:
            student_id = s["id"]
            attendance_pct = AcademicRepository.get_attendance_percentage(student_id)
            latest_stress = WellnessRepository.get_latest_stress_for_student(student_id)
            
            # Risk classification logic: High, Medium, Low
            risk_level = "low"
            if attendance_pct < 70 or (latest_stress is not None and latest_stress > 75):
                risk_level = "high"
            elif attendance_pct < 80 or (latest_stress is not None and latest_stress > 55):
                risk_level = "medium"
                
            classroom_students.append({
                "id": s["id"],
                "name": s["full_name"],
                "email": s["email"],
                "class_name": s["class_name"] or "N/A",
                "attendance_percentage": f"{attendance_pct}%",
                "stress_level": latest_stress if latest_stress is not None else 0,
                "risk_level": risk_level,
                "marks_average": "72%" # Default simulated grades average
            })
            
        return classroom_students

    @staticmethod
    def get_assignments(teacher_email: str) -> List[dict]:
        teacher = ProfileRepository.get_teacher_by_email(teacher_email)
        if not teacher:
            return []
            
        return AcademicRepository.get_assignments_by_teacher(teacher["id"])

    @staticmethod
    def create_assignment(teacher_email: str, data: dict) -> Optional[dict]:
        teacher = ProfileRepository.get_teacher_by_email(teacher_email)
        if not teacher:
            return None
            
        # Resolve class_id from name and college
        class_name = data.get("className")
        class_id = None
        if class_name:
            clazz = AcademicRepository.get_class_by_name_and_college(class_name, teacher["college"])
            if clazz:
                class_id = clazz["id"]
                
        assignment_data = {
            "class_id": class_id,
            "teacher_id": teacher["id"],
            "subject": teacher["subject"],
            "title": data["title"],
            "description": data.get("description"),
            "due_date": data["dueDate"],
            "attachment_url": data.get("attachmentUrl")
        }
        
        return AcademicRepository.create_assignment(assignment_data)

    @staticmethod
    def update_assignment(teacher_email: str, assignment_id: int, data: dict) -> bool:
        teacher = ProfileRepository.get_teacher_by_email(teacher_email)
        if not teacher:
            return False
            
        assignment = AcademicRepository.get_assignment_by_id(assignment_id)
        if not assignment or assignment["teacher_id"] != teacher["id"]:
            return False
            
        assignment_data = {
            "title": data.get("title", assignment["title"]),
            "description": data.get("description", assignment["description"]),
            "due_date": data.get("dueDate", assignment["due_date"]),
            "attachment_url": data.get("attachmentUrl", assignment["attachment_url"])
        }
        
        return AcademicRepository.update_assignment(assignment_id, assignment_data)

    @staticmethod
    def delete_assignment(teacher_email: str, assignment_id: int) -> bool:
        teacher = ProfileRepository.get_teacher_by_email(teacher_email)
        if not teacher:
            return False
            
        assignment = AcademicRepository.get_assignment_by_id(assignment_id)
        if not assignment or assignment["teacher_id"] != teacher["id"]:
            return False
            
        return AcademicRepository.delete_assignment(assignment_id)
