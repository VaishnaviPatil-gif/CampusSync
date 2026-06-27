from datetime import datetime, timezone
from typing import List
from repositories.notification_repository import NotificationRepository

class NotificationService:
    @staticmethod
    def get_notifications(user_id: int) -> List[dict]:
        return NotificationRepository.get_notifications_by_user(user_id)

    @staticmethod
    def create_notification(user_id: int, title: str, message: str, channel: str = "InApp") -> dict:
        now = datetime.now(timezone.utc).isoformat()
        return NotificationRepository.create_notification(user_id, title, message, channel, now)

    @staticmethod
    def mark_as_read(notification_id: int) -> bool:
        return NotificationRepository.mark_as_read(notification_id)
