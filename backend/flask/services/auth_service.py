from datetime import datetime, timezone
from typing import Tuple
from repositories.user_repository import UserRepository
from utils.auth_utils import (
    validate_signup,
    validate_login,
    hash_password,
    verify_password,
    normalize_role,
    build_user_payload
)
from utils.jwt_utils import encode_token

class AuthService:
    @staticmethod
    def signup(data: dict) -> Tuple[bool, dict, int]:
        is_valid, error_msg = validate_signup(data)
        if not is_valid:
            return False, {"success": False, "error": {"code": 400, "message": error_msg}}, 400

        email = str(data["email"]).strip().lower()
        full_name = str(data["fullName"]).strip()
        role = normalize_role(str(data["role"]))
        college = str(data["college"]).strip()
        now = datetime.now(timezone.utc).isoformat()

        existing = UserRepository.get_by_email(email)
        if existing:
            return False, {"success": False, "error": {"code": 409, "message": "Account already exists. Please Sign In instead."}}, 409

        password_hash = hash_password(str(data["password"]))
        user_data = {
            "email": email,
            "full_name": full_name,
            "password_hash": password_hash,
            "role": role,
            "college": college,
            "provider": "local",
            "created_at": now,
            "updated_at": now
        }
        
        user_record = UserRepository.create(user_data)
        user_id = user_record["id"]
        
        # Generate JWT
        token = encode_token(user_id, email, role, college)
        
        user_payload = build_user_payload(email, full_name, role, college)
        return True, {
            "success": True,
            "message": "Account created successfully.",
            "token": token,
            "user": user_payload
        }, 201

    @staticmethod
    def login(data: dict) -> Tuple[bool, dict, int]:
        is_valid, error_msg = validate_login(data)
        if not is_valid:
            return False, {"success": False, "error": {"code": 400, "message": error_msg}}, 400

        email = str(data["email"]).strip().lower()
        role = normalize_role(str(data["role"]))
        college = str(data["college"]).strip()

        row = UserRepository.get_by_email(email)
        if not row:
            return False, {"success": False, "error": {"code": 404, "message": "Account does not exist. Please Sign Up first."}}, 404

        if not row["password_hash"]:
            return False, {"success": False, "error": {"code": 400, "message": "This account has no password set. Please reset your password or sign up again."}}, 400

        if not verify_password(row["password_hash"], str(data["password"])):
            return False, {"success": False, "error": {"code": 401, "message": "Invalid email or password."}}, 401

        now = datetime.now(timezone.utc).isoformat()
        UserRepository.update_role_and_college(email, role, college, now)
        
        # Generate JWT
        token = encode_token(row["id"], email, role, college)
        
        user_payload = build_user_payload(email, row["full_name"], role, college)
        return True, {
            "success": True,
            "message": "Login successful.",
            "token": token,
            "user": user_payload
        }, 200
