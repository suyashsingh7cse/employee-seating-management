"""
Run with: python seed.py
Wipes and repopulates the database with demo data — 24 seats (rows A-F,
4 columns each) and 20 employees across 5 departments, with 16 of them
(~67%) seated.

Safe to re-run: if the database already has employees, this refuses to
touch it unless you pass --force. That matters once this is deployed —
you don't want a re-run wiping real production data.
"""

import sys

from app import create_app
from app.models import db, Employee, Seat, SeatAssignment

DEPARTMENTS = ["Engineering", "Design", "Product", "Sales", "HR"]

EMPLOYEES = [
    ("Rahul Sharma", "rahul.sharma@company.com", "Engineering"),
    ("Priya Patel", "priya.patel@company.com", "Engineering"),
    ("John Mathew", "john.mathew@company.com", "Engineering"),
    ("Sarah Khan", "sarah.khan@company.com", "Engineering"),
    ("Mike Chen", "mike.chen@company.com", "Engineering"),
    ("Lisa Wong", "lisa.wong@company.com", "Design"),
    ("Arjun Verma", "arjun.verma@company.com", "Design"),
    ("Neha Gupta", "neha.gupta@company.com", "Design"),
    ("David Fernandes", "david.fernandes@company.com", "Product"),
    ("Ananya Iyer", "ananya.iyer@company.com", "Product"),
    ("Karan Malhotra", "karan.malhotra@company.com", "Product"),
    ("Emily Brown", "emily.brown@company.com", "Sales"),
    ("Rohan Kapoor", "rohan.kapoor@company.com", "Sales"),
    ("Sneha Reddy", "sneha.reddy@company.com", "Sales"),
    ("Vikram Singh", "vikram.singh@company.com", "Sales"),
    ("Pooja Nair", "pooja.nair@company.com", "HR"),
    ("Amit Joshi", "amit.joshi@company.com", "HR"),
    ("Kavya Menon", "kavya.menon@company.com", "Engineering"),
    ("Aditya Rao", "aditya.rao@company.com", "Design"),
    ("Divya Shah", "divya.shah@company.com", "Product"),
]

ROWS = ["A", "B", "C", "D", "E", "F"]
COLUMNS = 4

# Indices (0-based, row-major) of seats that stay empty, so the layout
# has a realistic mix rather than filling top-to-bottom.
EMPTY_SEAT_INDEXES = {1, 3, 6, 9, 12, 15, 18, 21}


def run(force=False):
    app = create_app()
    with app.app_context():
        db.create_all()
        if Employee.query.count() > 0 and not force:
            print(
                "Database already has data — skipping seed. "
                "Run with --force to wipe and reseed anyway."
            )
            return

        db.drop_all()
        db.create_all()

        seats = []
        for row in ROWS:
            for col in range(1, COLUMNS + 1):
                seat = Seat(seat_number=f"{row}{col:02d}", row=row, column=col)
                db.session.add(seat)
                seats.append(seat)
        db.session.commit()

        employees = []
        for name, email, department in EMPLOYEES:
            employee = Employee(name=name, email=email, department=department)
            db.session.add(employee)
            employees.append(employee)
        db.session.commit()

        seat_index = 0
        employee_index = 0
        assignments_made = 0
        while seat_index < len(seats) and employee_index < len(employees):
            if seat_index not in EMPTY_SEAT_INDEXES:
                db.session.add(
                    SeatAssignment(
                        employee_id=employees[employee_index].id,
                        seat_id=seats[seat_index].id,
                    )
                )
                employee_index += 1
                assignments_made += 1
            seat_index += 1
        db.session.commit()

        print(f"Seeded {len(seats)} seats, {len(employees)} employees, "
              f"{assignments_made} assignments "
              f"({employee_index} of {len(employees)} employees seated).")


if __name__ == "__main__":
    run(force="--force" in sys.argv)
