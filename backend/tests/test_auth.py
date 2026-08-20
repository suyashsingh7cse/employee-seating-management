def test_login_success(client):
    resp = client.post("/api/auth/login", json={"username": "admin", "password": "testpass"})
    assert resp.status_code == 200
    assert resp.get_json()["username"] == "admin"


def test_login_wrong_password(client):
    resp = client.post("/api/auth/login", json={"username": "admin", "password": "wrong"})
    assert resp.status_code == 401


def test_me_requires_login(client):
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401


def test_me_after_login(admin_client):
    resp = admin_client.get("/api/auth/me")
    assert resp.status_code == 200


def test_logout_clears_session(admin_client):
    admin_client.post("/api/auth/logout")
    resp = admin_client.get("/api/auth/me")
    assert resp.status_code == 401


def test_write_routes_require_login(client):
    """Employee creation is a write operation and must be protected."""
    resp = client.post(
        "/api/employees",
        json={"name": "X", "email": "x@company.com", "department": "Eng"},
    )
    assert resp.status_code == 401
