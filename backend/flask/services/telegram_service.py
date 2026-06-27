import requests
from config import Config

class TelegramService:
    @staticmethod
    def send_message(chat_id: str, message_text: str) -> bool:
        bot_token = Config.TELEGRAM_BOT_TOKEN
        if not bot_token:
            print("[TELEGRAM-FLASK] No bot token configured")
            return False
        
        try:
            url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
            payload = {
                "chat_id": chat_id,
                "text": message_text,
                "parse_mode": "HTML"
            }
            response = requests.post(url, json=payload, timeout=10)
            if response.status_code == 200:
                print(f"[TELEGRAM-FLASK] Message sent to {chat_id}: {message_text[:50]}...")
                return True
            else:
                print(f"[TELEGRAM-FLASK] Failed to send: {response.text}")
                return False
        except Exception as error:
            print(f"[TELEGRAM-FLASK] Error sending message: {error}")
            return False
