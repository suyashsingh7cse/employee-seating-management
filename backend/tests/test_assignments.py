def test_list_seats_requires_login(client, sample_seat):
    resp = client.get("/api/seats")
    assert resp.status_code == 401


def test_list_seats(admin_client, sample_seat):
    resp = admin_client.get("/api/seats")
    assert resp.status_code == 200
    seats = resp.get_json()
    assert len(seats) == 1
    assert seats[0]["is_occupied"] is False


def test_create_assignment(admin_client, sample_employee, sample_seat):
    resp = admin_client.post(
        "/api/assignments", json={"employee_id": sample_employee, "seat_id": sample_seat}
    )
    assert resp.status_code == 201
    body = resp.get_json()
    assert body["seat"]["id"] == sample_seat
    assert body["seat"]["is_occupied"] is True


def test_create_assignment_invalid_employee(admin_client, sample_seat):
    resp = admin_client.post(
        "/api/assignments", json={"employee_id": 999, "seat_id": sample_seat}
    )
    assert resp.status_code == 404


def test_create_assignment_invalid_seat(admin_client, sample_employee):
    resp = admin_client.post(
        "/api/assignments", json={"employee_id": sample_employee, "seat_id": 999}
    )
    assert resp.status_code == 404


def test_create_assignment_duplicate_seat(admin_client, sample_employee, sample_seat, app):
    from app.models import db, Employee

    admin_client.post("/api/assignments", json={"employee_id": sample_employee, "seat_id": sample_seat})

    with app.app_context():
        other = Employee(name="Other Person", email="other@company.com", department="Sales")
        db.session.add(other)
        db.session.commit()
        other_id = other.id

    resp = admin_client.post("/api/assignments", json={"employee_id": other_id, "seat_id": sample_seat})
    assert resp.status_code == 409


def test_create_assignment_employee_already_seated(admin_client, sample_employee, sample_seat, app):
    from app.models import db, Seat

    admin_client.post("/api/assignments", json={"employee_id": sample_employee, "seat_id": sample_seat})

    with app.app_context():
        seat2 = Seat(seat_number="A02", row="A", column=2)
        db.session.add(seat2)
        db.session.commit()
        seat2_id = seat2.id

    resp = admin_client.post("/api/assignments", json={"employee_id": sample_employee, "seat_id": seat2_id})
    assert resp.status_code == 409


def test_move_assignment(admin_client, sample_employee, sample_seat, app):
    from app.models import db, Seat

    admin_client.post(
        "/api/assignments", json={"employee_id": sample_employee, "seat_id": sample_seat}
    )
    assignment_id = admin_client.get("/api/assignments").get_json()[0]["id"]

    with app.app_context():
        seat2 = Seat(seat_number="B01", row="B", column=1)
        db.session.add(seat2)
        db.session.commit()
        seat2_id = seat2.id

    resp = admin_client.put(f"/api/assignments/{assignment_id}", json={"seat_id": seat2_id})
    assert resp.status_code == 200
    assert resp.get_json()["seat"]["id"] == seat2_id

    seats = admin_client.get("/api/seats").get_json()
    old_seat = next(s for s in seats if s["id"] == sample_seat)
    assert old_seat["is_occupied"] is False


def test_remove_assignment(admin_client, sample_employee, sample_seat):
    admin_client.post("/api/assignments", json={"employee_id": sample_employee, "seat_id": sample_seat})
    assignment_id = admin_client.get("/api/assignments").get_json()[0]["id"]

    resp = admin_client.delete(f"/api/assignments/{assignment_id}")
    assert resp.status_code == 204

    seats = admin_client.get("/api/seats").get_json()
    seat = next(s for s in seats if s["id"] == sample_seat)
    assert seat["is_occupied"] is False


def test_assignment_routes_require_login(client, sample_employee, sample_seat):
    resp = client.post(
        "/api/assignments", json={"employee_id": sample_employee, "seat_id": sample_seat}
    )
    assert resp.status_code == 401
