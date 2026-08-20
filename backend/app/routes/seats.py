from flask import Blueprint, jsonify

from app.models import Seat
from app.utils.auth_helpers import login_required

seats_bp = Blueprint("seats", __name__)


@seats_bp.get("")
@login_required
def list_seats():
    seats = Seat.query.order_by(Seat.row, Seat.column).all()
    return jsonify([s.to_dict() for s in seats]), 200
