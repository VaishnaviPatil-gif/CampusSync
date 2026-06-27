import sqlite3
from typing import Optional, Dict, List
from database.db import get_db_connection

class UserRepository:
    @staticmethod
    def get_by_email(email: str) -> Optional[dict]:
        with get_db_connection() as conn:
            row = conn.execute(
                "SELECT * FROM users WHERE email = ?", 
                (email.lower().strip(),)
            ).fetchone()
            return dict(row) if row else None

    @staticmethod
    def get_by_id(user_id: int) -> Optional[dict]:
        with get_db_connection() as conn:
            row = conn.execute(
                "SELECT * FROM users WHERE id = ?", 
                (user_id,)
            ).fetchone()
            return dict(row) if row else None

    @staticmethod
    def create(user_data: Dict) -> dict:
        with get_db_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO users (email, full_name, password_hash, role, college, provider, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    user_data["email"].lower().strip(),
                    user_data["full_name"].strip(),
                    user_data.get("password_hash"),
                    user_data["role"],
                    user_data["college"],
                    user_data.get("provider", "local"),
                    user_data["created_at"],
                    user_data["updated_at"]
                )
            )
            conn.commit()
            user_data["id"] = cursor.lastrowid
            return user_data

    @staticmethod
    def update_role_and_college(email: str, role: str, college: str, updated_at: str) -> bool:
        with get_db_connection() as conn:
            cursor = conn.execute(
                "UPDATE users SET role = ?, college = ?, updated_at = ? WHERE email = ?",
                (role, college, updated_at, email.lower().strip())
            )
            conn.commit()
            return cursor.rowcount > 0

    @staticmethod
    def count_by_role(role: str) -> int:
        with get_db_connection() as conn:
            row = conn.execute(
                "SELECT COUNT(*) as count FROM users WHERE role = ?", 
                (role,)
            ).fetchone()
            return row["count"] if row else 0

    @staticmethod
    def get_all_by_role(role: str) -> List[dict]:
        with get_db_connection() as conn:
            rows = conn.execute(
                "SELECT id, email, full_name, role, college FROM users WHERE role = ? ORDER BY full_name",
                (role,)
            ).fetchall()
            return [dict(row) for row in rows]
