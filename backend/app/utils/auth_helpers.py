from functools import wraps
from flask import session, jsonify


def login_required(view_func):
    @wraps(view_func)
    def wrapped(*args, **kwargs):
        if not session.get("is_admin"):
            return jsonify({"error": "Authentication required"}), 401
        return view_func(*args, **kwargs)

    return wrapped
