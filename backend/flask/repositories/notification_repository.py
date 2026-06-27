from typing import List
from database.db import get_db_connection

class NotificationRepository:
    @staticmethod
    def get_notifications_by_user(user_id: int) -> List[dict]:
        with get_db_connection() as conn:
            rows = conn.execute(
                "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
                (user_id,)
            ).fetchall()
            return [dict(row) for row in rows]

    @staticmethod
    def create_notification(user_id: int, title: str, message: str, channel: str, created_at: str) -> dict:
        with get_db_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO notifications (user_id, title, message, status, channel, created_at)
                VALUES (?, ?, ?, 'unread', ?, ?)
                """,
                (user_id, title, message, channel, created_at)
            )
            conn.commit()
            return {
                "id": cursor.lastrowid,
                "user_id": user_id,
                "title": title,
                "message": message,
                "status": "unread",
                "channel": channel,
                "created_at": created_at
            }

    @staticmethod
    def mark_as_read(notification_id: int) -> bool:
        with get_db_connection() as conn:
            cursor = conn.execute(
                "UPDATE notifications SET status = 'read' WHERE id = ?",
                (notification_id,)
            )
            conn.commit()
            return cursor.rowcount > 0
