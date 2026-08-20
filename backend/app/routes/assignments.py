from flask import Blueprint, request, jsonify

from app.models import db, SeatAssignment, utcnow
from app.utils.auth_helpers import login_required
from app.utils.validation import (
    get_employee_or_404,
    get_seat_or_404,
    ensure_seat_free,
    ensure_employee_unassigned,
)

assignments_bp = Blueprint("assignments", __name__)


@assignments_bp.get("")
@login_required
def list_assignments():
    assignments = SeatAssignment.query.all()
    return jsonify([a.to_dict() for a in assignments]), 200


@assignments_bp.post("")
@login_required
def create_assignment():
    data = request.get_json(silent=True) or {}
    employee_id = data.get("employee_id")
    seat_id = data.get("seat_id")

    if employee_id is None or seat_id is None:
        return jsonify({"error": "employee_id and seat_id are required"}), 400

    employee = get_employee_or_404(employee_id)
    seat = get_seat_or_404(seat_id)
    ensure_employee_unassigned(employee)
    ensure_seat_free(seat)

    assignment = SeatAssignment(employee_id=employee.id, seat_id=seat.id)
    db.session.add(assignment)
    db.session.commit()

    return jsonify(employee.to_dict()), 201


@assignments_bp.put("/<int:assignment_id>")
@login_required
def move_assignment(assignment_id):
    """Moves the employee on this assignment to a different seat."""
    assignment = db.session.get(SeatAssignment, assignment_id)
    if not assignment:
        return jsonify({"error": f"Assignment {assignment_id} not found"}), 404

    data = request.get_json(silent=True) or {}
    new_seat_id = data.get("seat_id")
    if new_seat_id is None:
        return jsonify({"error": "seat_id is required"}), 400

    new_seat = get_seat_or_404(new_seat_id)
    if new_seat.id != assignment.seat_id:
        ensure_seat_free(new_seat)

    assignment.seat_id = new_seat.id
    assignment.assigned_at = utcnow()
    db.session.commit()

    return jsonify(assignment.employee.to_dict()), 200


@assignments_bp.delete("/<int:assignment_id>")
@login_required
def remove_assignment(assignment_id):
    assignment = db.session.get(SeatAssignment, assignment_id)
    if not assignment:
        return jsonify({"error": f"Assignment {assignment_id} not found"}), 404

    db.session.delete(assignment)
    db.session.commit()
    return "", 204
