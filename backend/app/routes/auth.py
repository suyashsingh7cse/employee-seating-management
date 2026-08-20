import secrets
from flask import Blueprint, request, session, jsonify, current_app

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    username = data.get("username", "")
    password = data.get("password", "")

    valid_username = secrets.compare_digest(username, current_app.config["ADMIN_USERNAME"])
    valid_password = secrets.compare_digest(password, current_app.config["ADMIN_PASSWORD"])

    if valid_username and valid_password:
        session.clear()
        session["is_admin"] = True
        session["username"] = username
        return jsonify({"username": username}), 200

    return jsonify({"error": "Invalid username or password"}), 401


@auth_bp.post("/logout")
def logout():
    session.clear()
    return "", 204


@auth_bp.get("/me")
def me():
    if session.get("is_admin"):
        return jsonify({"username": session.get("username")}), 200
    return jsonify({"error": "Not authenticated"}), 401
