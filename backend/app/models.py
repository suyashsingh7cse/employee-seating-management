from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import event
from sqlalchemy.engine import Engine

db = SQLAlchemy()


@event.listens_for(Engine, "connect")
def _enable_sqlite_wal(dbapi_connection, connection_record):
    """WAL mode lets reads and writes happen concurrently instead of
    blocking each other, which matters once Gunicorn is serving requests
    on multiple threads (see the production Dockerfile: 1 worker, 4
    threads). Runs once per new connection; SQLite persists the mode in
    the database file itself, so this is cheap after the first call."""
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.close()


def utcnow():
    return datetime.now(timezone.utc)


class Employee(db.Model):
    __tablename__ = "employee"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    department = db.Column(db.String(80), nullable=False)
    created_at = db.Column(db.DateTime, default=utcnow)

    # One row max per employee in SeatAssignment (see unique=True below),
    # so this relationship is effectively "current seat, if any".
    # cascade="all, delete-orphan" means: deleting an Employee automatically
    # deletes their SeatAssignment row too, freeing the seat. This is the
    # cascade behavior we agreed on rather than leaving an orphaned row.
    assignment = db.relationship(
        "SeatAssignment",
        backref="employee",
        uselist=False,
        cascade="all, delete-orphan",
        passive_deletes=False,
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "department": self.department,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "seat": self.assignment.seat.to_dict() if self.assignment else None,
        }


class Seat(db.Model):
    __tablename__ = "seat"

    id = db.Column(db.Integer, primary_key=True)
    seat_number = db.Column(db.String(10), nullable=False, unique=True)
    row = db.Column(db.String(5), nullable=False)
    column = db.Column(db.Integer, nullable=False)

    assignment = db.relationship("SeatAssignment", backref="seat", uselist=False)

    def to_dict(self):
        return {
            "id": self.id,
            "seat_number": self.seat_number,
            "row": self.row,
            "column": self.column,
            "is_occupied": self.assignment is not None,
            "employee": (
                {"id": self.assignment.employee.id, "name": self.assignment.employee.name}
                if self.assignment
                else None
            ),
        }


class SeatAssignment(db.Model):
    __tablename__ = "seat_assignment"

    id = db.Column(db.Integer, primary_key=True)

    # unique=True on both foreign keys is what enforces, at the database
    # level, "an employee has at most one current seat" and "a seat has
    # at most one employee" — matching the no-history design (this table
    # only ever holds *current* assignments, one row each).
    employee_id = db.Column(
        db.Integer, db.ForeignKey("employee.id"), nullable=False, unique=True
    )
    seat_id = db.Column(
        db.Integer, db.ForeignKey("seat.id"), nullable=False, unique=True
    )
    assigned_at = db.Column(db.DateTime, default=utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "employee_id": self.employee_id,
            "seat_id": self.seat_id,
            "assigned_at": self.assigned_at.isoformat() if self.assigned_at else None,
        }
