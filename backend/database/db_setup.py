import sqlite3
import os
from pathlib import Path
from datetime import datetime, timezone, timedelta
from werkzeug.security import generate_password_hash

DB_PATH = Path(__file__).resolve().parent / "student360.db"
SCHEMA_PATH = Path(__file__).resolve().parent / "schema.sql"

COLLEGES = [
    "BRECW", "Anurag University", "BVRIT", "MREM", "JNTUH", "CBIT", "VNRVJIET"
]

CLASS_OPTIONS = ["CSE-A", "CSE-B", "CSE-C", "ECE-A", "IT-A", "IT-B"]

TEACHERS_DATA = [
    {"name": "Prof. Srinivas Rao", "email": "srinivas@teacher.local", "subject": "Mathematics"},
    {"name": "Dr. Lakshmi Prasad", "email": "lakshmi@teacher.local", "subject": "Physics"},
    {"name": "Mrs. Vijaya Lakshmi", "email": "vijaya@teacher.local", "subject": "Chemistry"},
    {"name": "Mr. John Doe", "email": "john@teacher.local", "subject": "English"},
    {"name": "Dr. Rajesh Kumar", "email": "rajesh@teacher.local", "subject": "Computer Science"},
    {"name": "Prof. K. Satyanarayana", "email": "satya@teacher.local", "subject": "Electronics"},
    {"name": "Mrs. Padmaja G", "email": "padmaja@teacher.local", "subject": "Data Structures"},
]

STUDENTS_LIST = [
  { "id": 1, "name": "Aarav Patel", "class": "CSE-A", "college": "BRECW", "email": "aarav.patel@student.local" },
  { "id": 2, "name": "Diya Sharma", "class": "CSE-A", "college": "BRECW", "email": "diya.sharma@student.local" },
  { "id": 3, "name": "Rohan Verma", "class": "CSE-B", "college": "BRECW", "email": "rohan.verma@student.local" },
  { "id": 4, "name": "Meera Nair", "class": "CSE-C", "college": "BRECW", "email": "meera.nair@student.local" },

  { "id": 5, "name": "Ananya Reddy", "class": "CSE-B", "college": "Anurag University", "email": "ananya.reddy@student.local" },
  { "id": 6, "name": "Kiran Kumar", "class": "CSE-C", "college": "Anurag University", "email": "kiran.kumar@student.local" },
  { "id": 7, "name": "Priya Menon", "class": "ECE-A", "college": "Anurag University", "email": "priya.menon@student.local" },
  { "id": 8, "name": "Siddharth Rao", "class": "IT-A", "college": "Anurag University", "email": "siddharth.rao@student.local" },

  { "id": 9, "name": "Ishita Gupta", "class": "CSE-A", "college": "BVRIT", "email": "ishita.gupta@student.local" },
  { "id": 10, "name": "Vikram Singh", "class": "CSE-A", "college": "BVRIT", "email": "vikram.singh@student.local" },
  { "id": 11, "name": "Nisha Iyer", "class": "CSE-B", "college": "BVRIT", "email": "nisha.iyer@student.local" },
  { "id": 12, "name": "Rahul Das", "class": "CSE-C", "college": "BVRIT", "email": "rahul.das@student.local" },

  { "id": 13, "name": "Kavya Jain", "class": "ECE-A", "college": "MREM", "email": "kavya.jain@student.local" },
  { "id": 14, "name": "Aditya Kulkarni", "class": "ECE-A", "college": "MREM", "email": "aditya.kulkarni@student.local" },
  { "id": 15, "name": "Pooja Desai", "class": "IT-A", "college": "MREM", "email": "pooja.desai@student.local" },
  { "id": 16, "name": "Arjun Nair", "class": "IT-B", "college": "MREM", "email": "arjun.nair@student.local" },

  { "id": 17, "name": "Sneha Verma", "class": "CSE-C", "college": "JNTUH", "email": "sneha.verma@student.local" },
  { "id": 18, "name": "Yashwanth R", "class": "CSE-C", "college": "JNTUH", "email": "yashwanth.r@student.local" },
  { "id": 19, "name": "Madhuri P", "class": "CSE-A", "college": "JNTUH", "email": "madhuri.p@student.local" },
  { "id": 20, "name": "Tanvi S", "class": "CSE-B", "college": "JNTUH", "email": "tanvi.s@student.local" },

  { "id": 21, "name": "Harsha Vardhan", "class": "CSE-C", "college": "CBIT", "email": "harsha.vardhan@student.local" },
  { "id": 22, "name": "Lavanya K", "class": "IT-A", "college": "CBIT", "email": "lavanya.k@student.local" },
  { "id": 23, "name": "Ritesh Chawla", "class": "IT-B", "college": "CBIT", "email": "ritesh.chawla@student.local" },
  { "id": 24, "name": "Meghana S", "class": "CSE-A", "college": "CBIT", "email": "meghana.s@student.local" },

  { "id": 25, "name": "Sagarika T", "class": "CSE-B", "college": "VNRVJIET", "email": "sagarika.t@student.local" },
  { "id": 26, "name": "Naveen A", "class": "CSE-B", "college": "VNRVJIET", "email": "naveen.a@student.local" },
  { "id": 27, "name": "Deepika R", "class": "CSE-C", "college": "VNRVJIET", "email": "deepika.r@student.local" },
  { "id": 28, "name": "Bhavya M", "class": "CSE-A", "college": "VNRVJIET", "email": "bhavya.m@student.local" },
  { "id": 29, "name": "Rohan K", "class": "ECE-A", "college": "VNRVJIET", "email": "rohan.k@student.local" },
  { "id": 30, "name": "Keerthi L", "class": "ECE-B", "college": "VNRVJIET", "email": "keerthi.l@student.local" }
]

def setup_and_seed():
    print(f"Initializing database at: {DB_PATH}")
    
    # Read schema file
    with open(SCHEMA_PATH, "r", encoding="utf-8") as sf:
        schema_sql = sf.read()
        
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    # Execute schema
    cursor.executescript(schema_sql)
    conn.commit()
    print("Database schema executed successfully.")
    
    # Clear existing data
    cursor.execute("DELETE FROM notifications;")
    cursor.execute("DELETE FROM sensor_readings;")
    cursor.execute("DELETE FROM journal_entries;")
    cursor.execute("DELETE FROM mood_logs;")
    cursor.execute("DELETE FROM assignments;")
    cursor.execute("DELETE FROM attendance;")
    cursor.execute("DELETE FROM relationships;")
    cursor.execute("DELETE FROM parents;")
    cursor.execute("DELETE FROM teachers;")
    cursor.execute("DELETE FROM students;")
    cursor.execute("DELETE FROM classes;")
    cursor.execute("DELETE FROM users;")
    conn.commit()
    print("Cleaned up existing database records.")
    
    # Default hashed password
    password_hash = generate_password_hash("password")
    now_str = datetime.now(timezone.utc).isoformat()
    
    # Create classes
    class_map = {} # Maps (college, class_name) -> class_id
    for col in COLLEGES:
        for opt in CLASS_OPTIONS:
            cursor.execute(
                "INSERT INTO classes (name, college, created_at) VALUES (?, ?, ?)",
                (opt, col, now_str)
            )
            class_map[(col, opt)] = cursor.lastrowid
    conn.commit()
    print(f"Inserted {len(class_map)} class structures.")
    
    # Seed Teachers
    teacher_db_ids = []
    for col in COLLEGES:
        for teacher in TEACHERS_DATA:
            email = f"{teacher['email'].split('@')[0]}@{col.lower().replace(' ', '')}.edu"
            
            # Create user
            cursor.execute(
                "INSERT INTO users (email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
                (email, password_hash, "teacher", now_str, now_str)
            )
            user_id = cursor.lastrowid
            
            # Create teacher profile
            cursor.execute(
                "INSERT INTO teachers (user_id, full_name, college, subject, created_at) VALUES (?, ?, ?, ?, ?)",
                (user_id, teacher["name"], col, teacher["subject"], now_str)
            )
            teacher_db_ids.append(cursor.lastrowid)
    conn.commit()
    print(f"Inserted {len(teacher_db_ids)} teacher profiles.")
    
    # Seed Students and Parents
    student_count = 0
    parent_count = 0
    relationship_count = 0
    
    for std in STUDENTS_LIST:
        col = std["college"]
        cls_name = std["class"]
        class_id = class_map.get((col, cls_name))
        
        # Create student user
        cursor.execute(
            "INSERT INTO users (email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            (std["email"], password_hash, "student", now_str, now_str)
        )
        student_user_id = cursor.lastrowid
        
        # Create student profile
        cursor.execute(
            "INSERT INTO students (user_id, full_name, college, class_id, created_at) VALUES (?, ?, ?, ?, ?)",
            (student_user_id, std["name"], col, class_id, now_str)
        )
        student_id = cursor.lastrowid
        student_count += 1
        
        # Create parent user (every student has 1 parent registered for alerts)
        parent_email = f"parent.{std['email'].split('@')[0]}@parent.local"
        cursor.execute(
            "INSERT INTO users (email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            (parent_email, password_hash, "parent", now_str, now_str)
        )
        parent_user_id = cursor.lastrowid
        
        # Create parent profile
        cursor.execute(
            "INSERT INTO parents (user_id, full_name, college, created_at) VALUES (?, ?, ?, ?)",
            (parent_user_id, f"Parent of {std['name']}", col, now_str)
        )
        parent_id = cursor.lastrowid
        parent_count += 1
        
        # Link parent to student in relationships
        cursor.execute(
            "INSERT INTO relationships (parent_id, student_id, relation_type, telegram_chat_id) VALUES (?, ?, ?, ?)",
            (parent_id, student_id, "guardian", os.getenv("TELEGRAM_DEFAULT_CHAT_ID", "8680437609"))
        )
        relationship_count += 1
        
        # Seed dummy attendance (last 10 school days)
        base_date = datetime.now() - timedelta(days=15)
        for i in range(12):
            test_date = base_date + timedelta(days=i)
            # Skip weekends
            if test_date.weekday() >= 5:
                continue
            status = "Present" if (i % 7 != 0) else "Absent"
            cursor.execute(
                "INSERT INTO attendance (student_id, date, status, details) VALUES (?, ?, ?, ?)",
                (student_id, test_date.strftime("%Y-%m-%d"), status, "Regular class session")
            )
            
        # Seed dummy mood logs (past 3 days)
        for d_offset in range(3):
            log_time = (datetime.now() - timedelta(days=d_offset)).isoformat()
            mood = "happy" if d_offset % 2 == 0 else "neutral"
            cursor.execute(
                "INSERT INTO mood_logs (student_id, mood, stress_level, recorded_at) VALUES (?, ?, ?, ?)",
                (student_id, mood, 25 + d_offset * 10, log_time)
            )
            
    conn.commit()
    print(f"Inserted {student_count} student profiles.")
    print(f"Inserted {parent_count} parent profiles.")
    print(f"Linked {relationship_count} student-parent relationships.")
    
    # Create sample assignments from teachers
    cursor.execute("SELECT classes.id as class_id, teachers.id as teacher_id, teachers.subject FROM teachers JOIN classes ON teachers.college = classes.college LIMIT 10")
    tc_rows = cursor.fetchall()
    
    assignment_count = 0
    for idx, tc in enumerate(tc_rows):
        due_date = (datetime.now() + timedelta(days=5 + idx)).strftime("%Y-%m-%d")
        cursor.execute(
            """
            INSERT INTO assignments (class_id, teacher_id, subject, title, description, due_date, attachment_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                tc["class_id"],
                tc["teacher_id"],
                tc["subject"],
                f"Assignment on {tc['subject']} Unit {idx + 1}",
                f"Read chapter {idx + 1} and solve problems at the end.",
                due_date,
                f"http://example.com/assets/assignment_unit_{idx+1}.pdf"
            )
        )
        assignment_count += 1
    conn.commit()
    print(f"Seeded {assignment_count} classroom assignments.")
    
    conn.close()
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    setup_and_seed()
