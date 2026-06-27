from typing import List, Optional
from database.db import get_db_connection

class WellnessRepository:
    # --- Mood Logs ---
    @staticmethod
    def get_mood_logs_by_student(student_id: int) -> List[dict]:
        with get_db_connection() as conn:
            rows = conn.execute(
                "SELECT * FROM mood_logs WHERE student_id = ? ORDER BY recorded_at DESC",
                (student_id,)
            ).fetchall()
            return [dict(row) for row in rows]

    @staticmethod
    def add_mood_log(student_id: int, mood: str, stress_level: int, recorded_at: str) -> dict:
        with get_db_connection() as conn:
            cursor = conn.execute(
                "INSERT INTO mood_logs (student_id, mood, stress_level, recorded_at) VALUES (?, ?, ?, ?)",
                (student_id, mood, stress_level, recorded_at)
            )
            conn.commit()
            return {
                "id": cursor.lastrowid,
                "student_id": student_id,
                "mood": mood,
                "stress_level": stress_level,
                "recorded_at": recorded_at
            }

    # --- Journal Entries ---
    @staticmethod
    def get_journal_entries_by_student(student_id: int) -> List[dict]:
        with get_db_connection() as conn:
            rows = conn.execute(
                "SELECT * FROM journal_entries WHERE student_id = ? ORDER BY created_at DESC",
                (student_id,)
            ).fetchall()
            return [dict(row) for row in rows]

    @staticmethod
    def add_journal_entry(student_id: int, entry_text: str, sentiment_score: Optional[float], created_at: str) -> dict:
        with get_db_connection() as conn:
            cursor = conn.execute(
                "INSERT INTO journal_entries (student_id, entry_text, sentiment_score, created_at) VALUES (?, ?, ?, ?)",
                (student_id, entry_text, sentiment_score, created_at)
            )
            conn.commit()
            return {
                "id": cursor.lastrowid,
                "student_id": student_id,
                "entry_text": entry_text,
                "sentiment_score": sentiment_score,
                "created_at": created_at
            }

    # --- Sensor Readings ---
    @staticmethod
    def get_latest_sensor_reading() -> Optional[dict]:
        with get_db_connection() as conn:
            row = conn.execute(
                "SELECT * FROM sensor_readings ORDER BY received_at DESC LIMIT 1"
            ).fetchone()
            return dict(row) if row else None

    @staticmethod
    def get_sensor_readings_history(limit: int = 50) -> List[dict]:
        with get_db_connection() as conn:
            rows = conn.execute(
                "SELECT * FROM sensor_readings ORDER BY received_at DESC LIMIT ?",
                (limit,)
            ).fetchall()
            # Return ascending for chronological charts
            return [dict(row) for row in reversed(rows)]

    @staticmethod
    def add_sensor_reading(temp: Optional[float], hum: Optional[float], hr: Optional[float], stress: Optional[float], received_at: str) -> dict:
        with get_db_connection() as conn:
            cursor = conn.execute(
                "INSERT INTO sensor_readings (temperature, humidity, heart_rate, stress_level, received_at) VALUES (?, ?, ?, ?, ?)",
                (temp, hum, hr, stress, received_at)
            )
            conn.commit()
            return {
                "id": cursor.lastrowid,
                "temperature": temp,
                "humidity": hum,
                "heart_rate": hr,
                "stress_level": stress,
                "received_at": received_at
            }
            
    @staticmethod
    def get_latest_stress_for_student(student_id: int) -> Optional[int]:
        with get_db_connection() as conn:
            row = conn.execute(
                "SELECT stress_level FROM mood_logs WHERE student_id = ? ORDER BY recorded_at DESC LIMIT 1",
                (student_id,)
            ).fetchone()
            return row["stress_level"] if row else None
            
    @staticmethod
    def get_weak_subjects_count(student_id: int) -> int:
        # Currently simulated or static for this version
        return 2
