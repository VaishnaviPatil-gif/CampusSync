import sqlite3
from config import Config

def get_db_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(Config.DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection

def init_db() -> None:
    Config.DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with get_db_connection() as connection:
        # We will initialize tables here if they don't exist
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                full_name TEXT NOT NULL,
                password_hash TEXT,
                role TEXT NOT NULL,
                college TEXT NOT NULL,
                provider TEXT NOT NULL DEFAULT 'local',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        connection.commit()
