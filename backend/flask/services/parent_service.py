from typing import List
from repositories.profile_repository import ProfileRepository
from repositories.academic_repository import AcademicRepository
from repositories.wellness_repository import WellnessRepository

class ParentService:
    @staticmethod
    def get_parent_dashboard(parent_email: str) -> List[dict]:
        parent = ProfileRepository.get_parent_by_email(parent_email)
        if not parent:
            return []
            
        children = ProfileRepository.get_children_for_parent(parent["id"])
        
        dashboard_data = []
        for child in children:
            student_id = child["id"]
            attendance_pct = AcademicRepository.get_attendance_percentage(student_id)
            latest_stress = WellnessRepository.get_latest_stress_for_student(student_id)
            
            # Risk classification: High Risk, Needs Attention, Stable
            risk_classification = "Stable"
            if attendance_pct < 70 or (latest_stress is not None and latest_stress > 75):
                risk_classification = "High Risk"
            elif attendance_pct < 80 or (latest_stress is not None and latest_stress > 55):
                risk_classification = "Needs Attention"
                
            dashboard_data.append({
                "student_id": child["id"],
                "name": child["full_name"],
                "class_name": child["class_name"] or "N/A",
                "college": child["college"],
                "attendance_percentage": f"{attendance_pct}%",
                "stress_level": latest_stress if latest_stress is not None else 0,
                "risk_classification": risk_classification,
                "marks_average": "72%" # Default simulated grades average
            })
            
        return dashboard_data
