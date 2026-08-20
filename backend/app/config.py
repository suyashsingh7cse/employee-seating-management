import os
from pathlib import Path

# Directory of the backend/ folder, so relative paths behave the same
# whether you run `python run.py` from backend/ or via Docker.
BASE_DIR = Path(__file__).resolve().parent.parent


class Config:
    SECRET_KEY = os.environ.get("FLASK_SECRET_KEY", "dev-secret-not-for-production")

    IS_PRODUCTION = os.environ.get("FLASK_ENV", "development") == "production"

    _db_path = os.environ.get("DATABASE_PATH", "instance/seating.db")
    # If DATABASE_PATH isn't absolute, resolve it relative to backend/
    _db_path = (
        _db_path if os.path.isabs(_db_path) else str(BASE_DIR / _db_path)
    )
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{_db_path}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")

    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
    GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.1-flash-lite")

    # Where the compiled React build lives, if it's been built. The
    # production Docker image copies frontend/dist here at build time;
    # in local dev this directory simply doesn't exist, and Flask skips
    # registering the static-serving route (see app/__init__.py).
    FRONTEND_BUILD_DIR = Path(os.environ.get("FRONTEND_BUILD_DIR", str(BASE_DIR / "static")))

    # Session cookie settings — same-origin single-service deploy, so we
    # keep this simple rather than configuring cross-site cookie flags.
    # SECURE is tied to FLASK_ENV so dev over plain http still works.
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = IS_PRODUCTION

    # Defensive cap on request body size (1 MB) — this app never needs
    # large payloads, so reject anything abnormal before it's parsed.
    MAX_CONTENT_LENGTH = 1 * 1024 * 1024
