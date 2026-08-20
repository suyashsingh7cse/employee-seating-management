import os
from pathlib import Path

from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.models import db


def create_app(config_class=Config):
    app = Flask(__name__, static_folder=None)
    app.config.from_object(config_class)

    # SQLite needs the containing directory to already exist (e.g.
    # backend/instance/ in dev, or the Railway volume mount in prod) —
    # create it up front so a fresh checkout doesn't fail on first run.
    db_uri = app.config["SQLALCHEMY_DATABASE_URI"]
    if db_uri.startswith("sqlite:///"):
        db_file_path = db_uri.replace("sqlite:///", "", 1)
        Path(db_file_path).parent.mkdir(parents=True, exist_ok=True)

    db.init_app(app)

    # CORS is only needed in dev, where Vite (localhost:5173) and Flask
    # (localhost:5001) run on different ports/origins. In production we
    # serve the compiled React build from Flask itself (same origin), so
    # this has no effect there.
    CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

    with app.app_context():
        db.create_all()

    from app.routes.auth import auth_bp
    from app.routes.employees import employees_bp
    from app.routes.seats import seats_bp
    from app.routes.assignments import assignments_bp
    from app.routes.ai import ai_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(employees_bp, url_prefix="/api/employees")
    app.register_blueprint(seats_bp, url_prefix="/api/seats")
    app.register_blueprint(assignments_bp, url_prefix="/api/assignments")
    app.register_blueprint(ai_bp, url_prefix="/api/ai")

    # Single place that turns a ValidationError raised anywhere (manual
    # routes now, the AI command route in Phase 3) into a consistent
    # JSON error response — routes just call the validation helpers and
    # let the error propagate instead of repeating try/except everywhere.
    from app.utils.validation import ValidationError
    from flask import jsonify as _jsonify

    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        return _jsonify({"error": error.message}), error.status_code

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    # Serves the compiled React build when present. In dev (no build,
    # Vite dev server on :5173 instead) this block simply doesn't
    # register, so nothing changes for local development. In production
    # (Docker/Railway) the frontend is built into FRONTEND_BUILD_DIR and
    # Flask serves it directly — same origin as the API, no CORS or
    # cross-site cookie config needed for real traffic.
    build_dir = app.config["FRONTEND_BUILD_DIR"]
    if build_dir.is_dir():
        from flask import send_from_directory

        @app.get("/")
        @app.get("/<path:path>")
        def serve_frontend(path=""):
            target = build_dir / path
            if path and target.is_file():
                return send_from_directory(build_dir, path)
            return send_from_directory(build_dir, "index.html")

    return app
