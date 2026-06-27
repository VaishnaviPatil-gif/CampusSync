from datetime import datetime, timezone
from typing import Dict, Optional
from repositories.profile_repository import ProfileRepository
from repositories.academic_repository import AcademicRepository
from repositories.wellness_repository import WellnessRepository

class StudentService:
    @staticmethod
    def get_dashboard(email: str) -> Optional[dict]:
        student = ProfileRepository.get_student_by_email(email)
        if not student:
            return None

        student_id = student["id"]
        class_id = student["class_id"]

        # Academic KPIs
        attendance_pct = AcademicRepository.get_attendance_percentage(student_id)
        assignments_count = AcademicRepository.get_assignments_count(class_id) if class_id else 0
        weak_count = WellnessRepository.get_weak_subjects_count(student_id)
        
        # Sensor data
        latest_reading = WellnessRepository.get_latest_sensor_reading() or {}
        
        # Stress & Mood
        latest_stress = WellnessRepository.get_latest_stress_for_student(student_id)
        
        return {
            "student_info": {
                "id": student_id,
                "name": student["full_name"],
                "college": student["college"],
                "class_name": student["class_name"] or "N/A",
            },
            "academic_kpis": {
                "attendance_percentage": f"{attendance_pct}%",
                "engagement_score": "8.3/10", # Static placeholder from legacy frontend
                "assignments_count": assignments_count,
                "weak_subjects_count": weak_count,
                "suggestions_count": 3
            },
            "vitals": {
                "temperature": latest_reading.get("temperature"),
                "humidity": latest_reading.get("humidity"),
                "heart_rate": latest_reading.get("heart_rate"),
                "stress_level": latest_stress if latest_stress is not None else latest_reading.get("stress_level"),
                "received_at": latest_reading.get("received_at")
            }
        }

    @staticmethod
    def get_attendance(email: str) -> list:
        student = ProfileRepository.get_student_by_email(email)
        if not student:
            return []
        return AcademicRepository.get_attendance_by_student(student["id"])

    @staticmethod
    def get_mood(email: str) -> list:
        student = ProfileRepository.get_student_by_email(email)
        if not student:
            return []
        return WellnessRepository.get_mood_logs_by_student(student["id"])

    @staticmethod
    def get_journal(email: str) -> list:
        student = ProfileRepository.get_student_by_email(email)
        if not student:
            return []
        return WellnessRepository.get_journal_entries_by_student(student["id"])
        
    @staticmethod
    def add_mood_log(email: str, mood: str, stress_level: int) -> Optional[dict]:
        student = ProfileRepository.get_student_by_email(email)
        if not student:
            return None
        now = datetime.now(timezone.utc).isoformat()
        return WellnessRepository.add_mood_log(student["id"], mood, stress_level, now)

    @staticmethod
    def add_journal_entry(email: str, entry_text: str, sentiment_score: Optional[float] = None) -> Optional[dict]:
        student = ProfileRepository.get_student_by_email(email)
        if not student:
            return None
        now = datetime.now(timezone.utc).isoformat()
        return WellnessRepository.add_journal_entry(student["id"], entry_text, sentiment_score, now)
