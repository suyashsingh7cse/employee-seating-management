import os
import tempfile

import pytest

os.environ.setdefault("ADMIN_USERNAME", "admin")
os.environ.setdefault("ADMIN_PASSWORD", "testpass")

from app import create_app
from app.config import Config
from app.models import db, Employee, Seat


class TestConfig(Config):
    TESTING = True
    ADMIN_USERNAME = "admin"
    ADMIN_PASSWORD = "testpass"


@pytest.fixture
def app():
    db_fd, db_path = tempfile.mkstemp(suffix=".db")
    TestConfig.SQLALCHEMY_DATABASE_URI = f"sqlite:///{db_path}"

    app = create_app(TestConfig)

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

    os.close(db_fd)
    os.unlink(db_path)


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def admin_client(client):
    """A test client that's already logged in as admin."""
    client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "testpass"},
    )
    return client


@pytest.fixture
def sample_employee(app):
    with app.app_context():
        employee = Employee(name="Test Employee", email="test@company.com", department="Engineering")
        db.session.add(employee)
        db.session.commit()
        return employee.id


@pytest.fixture
def sample_seat(app):
    with app.app_context():
        seat = Seat(seat_number="A01", row="A", column=1)
        db.session.add(seat)
        db.session.commit()
        return seat.id
