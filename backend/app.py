import sys
from pathlib import Path

# Add flask subdirectory to path for absolute imports inside the modular folder
flask_dir = Path(__file__).resolve().parent / "flask"
sys.path.append(str(flask_dir))

from flask_app import app
from config import Config

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=Config.PORT, debug=Config.DEBUG)
