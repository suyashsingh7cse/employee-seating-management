"""
Shared validation logic.

This is the single place that decides whether an assignment operation is
allowed. Both the manual (React button click) API routes AND the future
AI command route (Phase 3) call these same functions — that's what makes
"the AI cannot bypass backend rules" true rather than just a slide in the
README.
"""

import re

from app.models import db, Employee, Seat


class ValidationError(Exception):
    """Raised for any rule violation. Routes catch this and turn it into
    a JSON error response with the right HTTP status code."""

    def __init__(self, message, status_code=400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def get_employee_or_404(employee_id):
    employee = db.session.get(Employee, employee_id)
    if not employee:
        raise ValidationError(f"Employee {employee_id} not found", 404)
    return employee


def get_seat_or_404(seat_id):
    seat = db.session.get(Seat, seat_id)
    if not seat:
        raise ValidationError(f"Seat {seat_id} not found", 404)
    return seat


def ensure_seat_free(seat):
    if seat.assignment is not None:
        raise ValidationError(f"Seat {seat.seat_number} is already occupied", 409)


def ensure_employee_unassigned(employee):
    if employee.assignment is not None:
        raise ValidationError(
            f"{employee.name} already has a seat ({employee.assignment.seat.seat_number}). "
            "Move or remove the existing assignment first.",
            409,
        )


def find_employee_by_name(name):
    """Case-insensitive, whitespace-tolerant name lookup — used by the
    AI command handler in Phase 3, since Gemini gives us a name, not an id."""
    if not name or not name.strip():
        raise ValidationError("Employee name is required", 400)
    employee = Employee.query.filter(Employee.name.ilike(name.strip())).first()
    if not employee:
        raise ValidationError(f"No employee found matching '{name}'", 404)
    return employee


def find_seat_by_number(seat_number):
    if not seat_number or not seat_number.strip():
        raise ValidationError("Seat number is required", 400)
    seat = Seat.query.filter_by(seat_number=seat_number.strip().upper()).first()
    if not seat:
        raise ValidationError(f"No seat found with number '{seat_number}'", 404)
    return seat


# Matches the column sizes in models.py (String(120)/String(80)) — SQLite
# itself won't enforce these, so we check explicitly before writing.
_EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def validate_employee_fields(name, email, department):
    if len(name) > 120:
        raise ValidationError("name must be 120 characters or fewer", 400)
    if len(email) > 120:
        raise ValidationError("email must be 120 characters or fewer", 400)
    if not _EMAIL_PATTERN.match(email):
        raise ValidationError("email is not a valid email address", 400)
    if len(department) > 80:
        raise ValidationError("department must be 80 characters or fewer", 400)
