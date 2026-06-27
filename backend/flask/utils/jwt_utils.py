import jwt
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict
from config import Config

def encode_token(user_id: int, email: str, role: str, college: str) -> str:
    try:
        payload = {
            "user_id": user_id,
            "email": email.lower().strip(),
            "role": role,
            "college": college,
            "exp": datetime.now(timezone.utc) + timedelta(days=1),
            "iat": datetime.now(timezone.utc)
        }
        return jwt.encode(payload, Config.SECRET_KEY, algorithm="HS256")
    except Exception as e:
        print(f"[JWT ENCODE ERROR] {e}")
        return ""

def decode_token(token: str) -> Optional[Dict]:
    try:
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        print("[JWT DECODE ERROR] Token expired")
        return None
    except jwt.InvalidTokenError:
        print("[JWT DECODE ERROR] Invalid token")
        return None
    except Exception as e:
        print(f"[JWT DECODE ERROR] {e}")
        return None
