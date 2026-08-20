from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError

from app.models import db, Employee
from app.utils.auth_helpers import login_required
from app.utils.validation import get_employee_or_404, validate_employee_fields

employees_bp = Blueprint("employees", __name__)


@employees_bp.get("")
@login_required
def list_employees():
    search = request.args.get("search", "").strip()
    query = Employee.query
    if search:
        like = f"%{search}%"
        query = query.filter(
            db.or_(Employee.name.ilike(like), Employee.department.ilike(like), Employee.email.ilike(like))
        )
    employees = query.order_by(Employee.name).all()
    return jsonify([e.to_dict() for e in employees]), 200


@employees_bp.post("")
@login_required
def create_employee():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    department = (data.get("department") or "").strip()

    if not name or not email or not department:
        return jsonify({"error": "name, email and department are all required"}), 400
    validate_employee_fields(name, email, department)

    employee = Employee(name=name, email=email, department=department)
    db.session.add(employee)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": f"An employee with email '{email}' already exists"}), 409

    return jsonify(employee.to_dict()), 201


@employees_bp.get("/<int:employee_id>")
@login_required
def get_employee(employee_id):
    employee = get_employee_or_404(employee_id)
    return jsonify(employee.to_dict()), 200


@employees_bp.put("/<int:employee_id>")
@login_required
def update_employee(employee_id):
    employee = get_employee_or_404(employee_id)

    data = request.get_json(silent=True) or {}
    if "name" in data:
        name = (data.get("name") or "").strip()
        if not name:
            return jsonify({"error": "name cannot be empty"}), 400
        employee.name = name
    if "email" in data:
        email = (data.get("email") or "").strip()
        if not email:
            return jsonify({"error": "email cannot be empty"}), 400
        employee.email = email
    if "department" in data:
        department = (data.get("department") or "").strip()
        if not department:
            return jsonify({"error": "department cannot be empty"}), 400
        employee.department = department

    validate_employee_fields(employee.name, employee.email, employee.department)

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "An employee with that email already exists"}), 409

    return jsonify(employee.to_dict()), 200


@employees_bp.delete("/<int:employee_id>")
@login_required
def delete_employee(employee_id):
    employee = get_employee_or_404(employee_id)

    # cascade="all, delete-orphan" on Employee.assignment (see models.py)
    # means this also removes their SeatAssignment row, freeing the seat.
    db.session.delete(employee)
    db.session.commit()
    return "", 204
