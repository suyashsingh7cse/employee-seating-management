from flask import Blueprint, request, jsonify, current_app

from app.models import db, Seat, SeatAssignment, utcnow
from app.utils.auth_helpers import login_required
from app.utils.validation import (
    ValidationError,
    find_employee_by_name,
    find_seat_by_number,
    ensure_seat_free,
    ensure_employee_unassigned,
)
from app.services.ai_service import interpret_command, AIServiceError

ai_bp = Blueprint("ai", __name__)


def _first_available_seat():
    # Seat.assignment is a uselist=False relationship, so .has() is the
    # correct existence check -- "seats with no linked SeatAssignment".
    return Seat.query.filter(~Seat.assignment.has()).order_by(Seat.row, Seat.column).first()


@ai_bp.post("/command")
@login_required
def ai_command():
    data = request.get_json(silent=True) or {}
    command = (data.get("command") or "").strip()
    if not command:
        return jsonify({"error": "command is required"}), 400
    if len(command) > 500:
        return jsonify({"error": "command is too long (500 characters max)"}), 400

    try:
        parsed = interpret_command(
            command,
            api_key=current_app.config["GEMINI_API_KEY"],
            model=current_app.config["GEMINI_MODEL"],
        )
    except AIServiceError as e:
        return jsonify({"error": e.message}), e.status_code

    action = parsed.get("action")

    # ------------------------------------------------------------------
    # Enforcement point. Whatever Gemini decided, only these four branches
    # can ever touch the database, and each one re-runs the exact same
    # validation helpers (app/utils/validation.py) that the manual React
    # buttons use. Anything else -- "UNSUPPORTED", a malformed action, or
    # an action Gemini was tricked into inventing by a prompt-injection
    # attempt in the command text -- falls through to the rejection at
    # the bottom and changes nothing.
    # ------------------------------------------------------------------

    if action == "FIND_AVAILABLE_SEAT":
        seat = _first_available_seat()
        if not seat:
            return jsonify({"message": "No seats are currently available."}), 200
        return jsonify({"message": f"Seat {seat.seat_number} is available.", "seat": seat.to_dict()}), 200

    if action == "ASSIGN_EMPLOYEE":
        employee_name = parsed.get("employee_name")
        if not employee_name:
            raise ValidationError("An employee name is required to assign a seat.", 400)
        employee = find_employee_by_name(employee_name)
        ensure_employee_unassigned(employee)

        seat_number = parsed.get("seat_number")
        if seat_number:
            seat = find_seat_by_number(seat_number)
            ensure_seat_free(seat)
        else:
            seat = _first_available_seat()
            if not seat:
                raise ValidationError("No seats are currently available.", 409)

        db.session.add(SeatAssignment(employee_id=employee.id, seat_id=seat.id))
        db.session.commit()
        return (
            jsonify(
                {
                    "message": f"{employee.name} has been assigned to {seat.seat_number}.",
                    "employee": employee.to_dict(),
                }
            ),
            201,
        )

    if action == "MOVE_EMPLOYEE":
        employee_name = parsed.get("employee_name")
        if not employee_name:
            raise ValidationError("An employee name is required to move someone.", 400)
        employee = find_employee_by_name(employee_name)
        if not employee.assignment:
            raise ValidationError(f"{employee.name} doesn't currently have a seat to move from.", 409)

        seat_number = parsed.get("seat_number")
        if not seat_number:
            raise ValidationError("A destination seat number is required to move an employee.", 400)
        new_seat = find_seat_by_number(seat_number)
        if new_seat.id != employee.assignment.seat_id:
            ensure_seat_free(new_seat)

        employee.assignment.seat_id = new_seat.id
        employee.assignment.assigned_at = utcnow()
        db.session.commit()
        return jsonify(
            {
                "message": f"{employee.name} has been moved to {new_seat.seat_number}.",
                "employee": employee.to_dict(),
            }
        ), 200

    if action == "REMOVE_EMPLOYEE":
        employee_name = parsed.get("employee_name")
        if not employee_name:
            raise ValidationError("An employee name is required to remove someone.", 400)
        employee = find_employee_by_name(employee_name)
        if not employee.assignment:
            raise ValidationError(f"{employee.name} doesn't currently have a seat.", 409)

        freed_seat_number = employee.assignment.seat.seat_number
        db.session.delete(employee.assignment)
        db.session.commit()
        return jsonify({"message": f"{employee.name} has been removed from {freed_seat_number}."}), 200

    # UNSUPPORTED, or anything not matching one of the four known shapes.
    reason = parsed.get("reason") if isinstance(parsed.get("reason"), str) else None
    message = "I can only assign, move, or remove an employee's seat, or find an available seat."
    if reason:
        message = f"{message} ({reason})"
    return jsonify({"error": message}), 400
