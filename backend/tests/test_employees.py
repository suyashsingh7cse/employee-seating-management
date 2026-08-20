def test_create_employee(admin_client):
    resp = admin_client.post(
        "/api/employees",
        json={"name": "Rahul Sharma", "email": "rahul@company.com", "department": "Engineering"},
    )
    assert resp.status_code == 201
    body = resp.get_json()
    assert body["name"] == "Rahul Sharma"
    assert body["seat"] is None


def test_create_employee_missing_field(admin_client):
    resp = admin_client.post("/api/employees", json={"name": "No Email"})
    assert resp.status_code == 400


def test_create_employee_duplicate_email(admin_client):
    payload = {"name": "A", "email": "dup@company.com", "department": "Eng"}
    first = admin_client.post("/api/employees", json=payload)
    assert first.status_code == 201
    second = admin_client.post("/api/employees", json=payload)
    assert second.status_code == 409


def test_create_employee_invalid_email_format(admin_client):
    resp = admin_client.post(
        "/api/employees",
        json={"name": "Bad Email", "email": "not-an-email", "department": "Eng"},
    )
    assert resp.status_code == 400


def test_create_employee_name_too_long(admin_client):
    resp = admin_client.post(
        "/api/employees",
        json={"name": "A" * 121, "email": "long@company.com", "department": "Eng"},
    )
    assert resp.status_code == 400


def test_list_employees_requires_login(client, sample_employee):
    resp = client.get("/api/employees")
    assert resp.status_code == 401


def test_list_employees_when_logged_in(admin_client, sample_employee):
    resp = admin_client.get("/api/employees")
    assert resp.status_code == 200
    assert len(resp.get_json()) == 1


def test_get_missing_employee(admin_client):
    resp = admin_client.get("/api/employees/999")
    assert resp.status_code == 404


def test_delete_employee(admin_client, sample_employee):
    resp = admin_client.delete(f"/api/employees/{sample_employee}")
    assert resp.status_code == 204
    assert admin_client.get(f"/api/employees/{sample_employee}").status_code == 404


def test_delete_employee_frees_seat(admin_client, sample_employee, sample_seat):
    """Cascade rule: deleting an employee removes their assignment too."""
    assign = admin_client.post(
        "/api/assignments", json={"employee_id": sample_employee, "seat_id": sample_seat}
    )
    assert assign.status_code == 201

    admin_client.delete(f"/api/employees/{sample_employee}")

    seats = admin_client.get("/api/seats").get_json()
    seat = next(s for s in seats if s["id"] == sample_seat)
    assert seat["is_occupied"] is False
