from typing import List, Optional
from database.db import get_db_connection

class AcademicRepository:
    # --- Attendance ---
    @staticmethod
    def get_attendance_by_student(student_id: int) -> List[dict]:
        with get_db_connection() as conn:
            rows = conn.execute(
                "SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC",
                (student_id,)
            ).fetchall()
            return [dict(row) for row in rows]

    @staticmethod
    def get_attendance_percentage(student_id: int) -> float:
        with get_db_connection() as conn:
            total_row = conn.execute("SELECT COUNT(*) as total FROM attendance WHERE student_id = ?", (student_id,)).fetchone()
            total = total_row["total"] if total_row else 0
            if total == 0:
                return 100.0 # Default
                
            present_row = conn.execute("SELECT COUNT(*) as present FROM attendance WHERE student_id = ? AND status = 'Present'", (student_id,)).fetchone()
            present = present_row["present"] if present_row else 0
            
            return round((present / total) * 100, 1)

    # --- Assignments ---
    @staticmethod
    def get_assignments_by_class(class_id: int) -> List[dict]:
        with get_db_connection() as conn:
            rows = conn.execute(
                """
                SELECT a.*, t.full_name as teacher_name 
                FROM assignments a 
                JOIN teachers t ON a.teacher_id = t.id 
                WHERE a.class_id = ? OR a.class_id IS NULL 
                ORDER BY a.due_date ASC
                """,
                (class_id,)
            ).fetchall()
            return [dict(row) for row in rows]

    @staticmethod
    def get_assignments_count(class_id: int) -> int:
        with get_db_connection() as conn:
            row = conn.execute(
                "SELECT COUNT(*) as count FROM assignments WHERE class_id = ? OR class_id IS NULL",
                (class_id,)
            ).fetchone()
            return row["count"] if row else 0

    @staticmethod
    def create_assignment(assignment_data: dict) -> dict:
        with get_db_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO assignments (class_id, teacher_id, subject, title, description, due_date, attachment_url)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    assignment_data.get("class_id"),
                    assignment_data["teacher_id"],
                    assignment_data["subject"],
                    assignment_data["title"],
                    assignment_data.get("description"),
                    assignment_data["due_date"],
                    assignment_data.get("attachment_url")
                )
            )
            conn.commit()
            assignment_data["id"] = cursor.lastrowid
            return assignment_data

    @staticmethod
    def update_assignment(assignment_id: int, assignment_data: dict) -> bool:
        with get_db_connection() as conn:
            cursor = conn.execute(
                """
                UPDATE assignments 
                SET title = ?, description = ?, due_date = ?, attachment_url = ?
                WHERE id = ?
                """,
                (
                    assignment_data["title"],
                    assignment_data.get("description"),
                    assignment_data["due_date"],
                    assignment_data.get("attachment_url"),
                    assignment_id
                )
            )
            conn.commit()
            return cursor.rowcount > 0

    @staticmethod
    def delete_assignment(assignment_id: int) -> bool:
        with get_db_connection() as conn:
            cursor = conn.execute("DELETE FROM assignments WHERE id = ?", (assignment_id,))
            conn.commit()
            return cursor.rowcount > 0

    @staticmethod
    def get_assignment_by_id(assignment_id: int) -> Optional[dict]:
        with get_db_connection() as conn:
            row = conn.execute("SELECT * FROM assignments WHERE id = ?", (assignment_id,)).fetchone()
            return dict(row) if row else None

    @staticmethod
    def get_assignments_by_teacher(teacher_id: int) -> List[dict]:
        with get_db_connection() as conn:
            rows = conn.execute(
                """
                SELECT a.*, c.name as class_name 
                FROM assignments a 
                LEFT JOIN classes c ON a.class_id = c.id 
                WHERE a.teacher_id = ? 
                ORDER BY a.due_date ASC
                """,
                (teacher_id,)
            ).fetchall()
            return [dict(row) for row in rows]
            
    # --- Classes ---
    @staticmethod
    def get_class_by_name_and_college(name: str, college: str) -> Optional[dict]:
        with get_db_connection() as conn:
            row = conn.execute(
                "SELECT * FROM classes WHERE name = ? AND college = ?", 
                (name, college)
            ).fetchone()
            return dict(row) if row else None
