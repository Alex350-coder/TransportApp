"""Auth API tests: register, login (JWT), me."""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

REGISTER_URL = "/api/v1/auth/register/"
TOKEN_URL = "/api/v1/auth/token/"
REFRESH_URL = "/api/v1/auth/token/refresh/"
ME_URL = "/api/v1/auth/me/"

VALID_PAYLOAD = {
    "email": "ana@example.com",
    "password": "S3guro-y-largo!",
    "first_name": "Ana",
    "last_name": "Torres",
    "phone": "+51 999 888 777",
}


@pytest.fixture
def client() -> APIClient:
    return APIClient()


@pytest.fixture
def existing_user(db):
    return User.objects.create_user(
        email=VALID_PAYLOAD["email"],
        password=VALID_PAYLOAD["password"],
        first_name="Ana",
        last_name="Torres",
    )


@pytest.mark.django_db
class TestRegister:
    def test_creates_user_and_returns_profile_in_envelope(self, client):
        response = client.post(REGISTER_URL, VALID_PAYLOAD, format="json")

        assert response.status_code == 201
        body = response.json()
        assert body["success"] is True
        assert body["error"] is None
        assert body["data"]["email"] == VALID_PAYLOAD["email"]
        assert "password" not in body["data"]
        assert User.objects.filter(email=VALID_PAYLOAD["email"]).exists()

    def test_rejects_duplicate_email(self, client, existing_user):
        response = client.post(REGISTER_URL, VALID_PAYLOAD, format="json")

        assert response.status_code == 400
        body = response.json()
        assert body["success"] is False
        assert body["error"]["code"] == "validation_error"
        assert "email" in body["error"]["fields"]

    def test_rejects_weak_password(self, client):
        payload = {**VALID_PAYLOAD, "password": "1234"}
        response = client.post(REGISTER_URL, payload, format="json")

        assert response.status_code == 400
        assert "password" in response.json()["error"]["fields"]

    def test_stores_hashed_password(self, client):
        client.post(REGISTER_URL, VALID_PAYLOAD, format="json")
        user = User.objects.get(email=VALID_PAYLOAD["email"])

        assert user.password != VALID_PAYLOAD["password"]
        assert user.check_password(VALID_PAYLOAD["password"])


@pytest.mark.django_db
class TestLogin:
    def test_returns_token_pair(self, client, existing_user):
        response = client.post(
            TOKEN_URL,
            {"email": VALID_PAYLOAD["email"], "password": VALID_PAYLOAD["password"]},
            format="json",
        )

        assert response.status_code == 200
        data = response.json()["data"]
        assert "access" in data
        assert "refresh" in data

    def test_rejects_wrong_credentials(self, client, existing_user):
        response = client.post(
            TOKEN_URL,
            {"email": VALID_PAYLOAD["email"], "password": "incorrecta"},
            format="json",
        )

        assert response.status_code == 401
        assert response.json()["success"] is False

    def test_refresh_returns_new_access(self, client, existing_user):
        login = client.post(
            TOKEN_URL,
            {"email": VALID_PAYLOAD["email"], "password": VALID_PAYLOAD["password"]},
            format="json",
        )
        refresh = login.json()["data"]["refresh"]

        response = client.post(REFRESH_URL, {"refresh": refresh}, format="json")

        assert response.status_code == 200
        assert "access" in response.json()["data"]


@pytest.mark.django_db
class TestMe:
    def test_requires_authentication(self, client):
        response = client.get(ME_URL)
        assert response.status_code == 401

    def test_returns_current_user(self, client, existing_user):
        client.force_authenticate(user=existing_user)
        response = client.get(ME_URL)

        assert response.status_code == 200
        data = response.json()["data"]
        assert data["email"] == existing_user.email
        assert data["first_name"] == "Ana"
