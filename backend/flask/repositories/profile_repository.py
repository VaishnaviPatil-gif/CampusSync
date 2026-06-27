from typing import Optional, List, Dict
from database.db import get_db_connection

class ProfileRepository:
    @staticmethod
    def get_student_by_user_id(user_id: int) -> Optional[dict]:
        with get_db_connection() as conn:
            row = conn.execute(
                """
                SELECT s.*, c.name as class_name 
                FROM students s 
                LEFT JOIN classes c ON s.class_id = c.id 
                WHERE s.user_id = ?
                """,
                (user_id,)
            ).fetchone()
            return dict(row) if row else None

    @staticmethod
    def get_student_by_id(student_id: int) -> Optional[dict]:
        with get_db_connection() as conn:
            row = conn.execute(
                """
                SELECT s.*, c.name as class_name 
                FROM students s 
                LEFT JOIN classes c ON s.class_id = c.id 
                WHERE s.id = ?
                """,
                (student_id,)
            ).fetchone()
            return dict(row) if row else None

    @staticmethod
    def get_teacher_by_user_id(user_id: int) -> Optional[dict]:
        with get_db_connection() as conn:
            row = conn.execute("SELECT * FROM teachers WHERE user_id = ?", (user_id,)).fetchone()
            return dict(row) if row else None

    @staticmethod
    def get_parent_by_user_id(user_id: int) -> Optional[dict]:
        with get_db_connection() as conn:
            row = conn.execute("SELECT * FROM parents WHERE user_id = ?", (user_id,)).fetchone()
            return dict(row) if row else None

    @staticmethod
    def get_children_for_parent(parent_id: int) -> List[dict]:
        with get_db_connection() as conn:
            rows = conn.execute(
                """
                SELECT s.*, c.name as class_name, r.relation_type, r.telegram_chat_id
                FROM relationships r
                JOIN students s ON r.student_id = s.id
                LEFT JOIN classes c ON s.class_id = c.id
                WHERE r.parent_id = ?
                """,
                (parent_id,)
            ).fetchall()
            return [dict(row) for row in rows]

    @staticmethod
    def get_students_by_college(college: str) -> List[dict]:
        with get_db_connection() as conn:
            rows = conn.execute(
                """
                SELECT s.*, c.name as class_name, u.email
                FROM students s
                JOIN users u ON s.user_id = u.id
                LEFT JOIN classes c ON s.class_id = c.id
                WHERE s.college = ?
                ORDER BY s.full_name
                """,
                (college,)
            ).fetchall()
            return [dict(row) for row in rows]

    @staticmethod
    def get_parent_chat_id_for_student(student_id: int) -> Optional[str]:
        with get_db_connection() as conn:
            row = conn.execute(
                "SELECT telegram_chat_id FROM relationships WHERE student_id = ? LIMIT 1",
                (student_id,)
            ).fetchone()
            return row["telegram_chat_id"] if row else None
            
    @staticmethod
    def update_telegram_chat_id(parent_id: int, student_id: int, chat_id: str) -> bool:
        with get_db_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO relationships (parent_id, student_id, relation_type, telegram_chat_id)
                VALUES (?, ?, 'guardian', ?)
                ON CONFLICT(parent_id, student_id) DO UPDATE SET telegram_chat_id = excluded.telegram_chat_id
                """,
                (parent_id, student_id, chat_id)
            )
            conn.commit()
            return cursor.rowcount > 0
            
    @staticmethod
    def get_parent_by_email(email: str) -> Optional[dict]:
        with get_db_connection() as conn:
            row = conn.execute(
                """
                SELECT p.* FROM parents p
                JOIN users u ON p.user_id = u.id
                WHERE u.email = ?
                """,
                (email.lower().strip(),)
            ).fetchone()
            return dict(row) if row else None
            
    @staticmethod
    def get_student_by_email(email: str) -> Optional[dict]:
        with get_db_connection() as conn:
            row = conn.execute(
                """
                SELECT s.* FROM students s
                JOIN users u ON s.user_id = u.id
                WHERE u.email = ?
                """,
                (email.lower().strip(),)
            ).fetchone()
            return dict(row) if row else None
