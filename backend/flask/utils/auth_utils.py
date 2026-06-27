from werkzeug.security import generate_password_hash, check_password_hash

CLASS_OPTIONS = ["CSE-A", "CSE-B", "CSE-C", "ECE-A", "IT-A", "IT-B"]
TEACHER_SUBJECTS = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "English",
    "Computer Science",
    "Electronics",
    "Data Structures",
]

def hash_password(password: str) -> str:
    return generate_password_hash(password)

def verify_password(password_hash: str, password: str) -> bool:
    return check_password_hash(password_hash, password)

def normalize_role(role: str) -> str:
    role_value = (role or "").strip().lower()
    if role_value not in {"student", "teacher", "parent"}:
        return ""
    return role_value

def assign_profile(email: str, full_name: str) -> tuple[str, str]:
    seed_text = email or full_name or "student"
    hash_value = 0
    for char in seed_text:
        hash_value = (hash_value * 31 + ord(char)) & 0xFFFFFFFF

    assigned_class = CLASS_OPTIONS[hash_value % len(CLASS_OPTIONS)]
    teacher_subject = TEACHER_SUBJECTS[hash_value % len(TEACHER_SUBJECTS)]
    return assigned_class, teacher_subject

def build_user_payload(email: str, full_name: str, role: str, college: str) -> dict:
    assigned_class, teacher_subject = assign_profile(email, full_name)
    return {
        "email": email,
        "full_name": full_name,
        "role": role,
        "college": college,
        "assigned_class": assigned_class,
        "teacher_subject": teacher_subject,
    }

def validate_signup(data: dict) -> tuple[bool, str]:
    required_fields = ["fullName", "email", "password", "confirmPassword", "role", "college"]
    for field in required_fields:
        if not str(data.get(field, "")).strip():
            return False, f"{field} is required."

    if data["password"] != data["confirmPassword"]:
        return False, "Passwords do not match."

    if len(str(data["password"])) < 6:
        return False, "Password must be at least 6 characters long."

    role = normalize_role(str(data.get("role", "")))
    if not role:
        return False, "Please choose Student, Teacher, or Parent."

    return True, ""

def validate_login(data: dict) -> tuple[bool, str]:
    required_fields = ["email", "password", "role", "college"]
    for field in required_fields:
        if not str(data.get(field, "")).strip():
            return False, f"{field} is required."

    role = normalize_role(str(data.get("role", "")))
    if not role:
        return False, "Please choose Student, Teacher, or Parent."

    return True, ""
