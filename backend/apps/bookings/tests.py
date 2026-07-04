"""Booking API tests, including the seat double-booking invariant."""
from datetime import timedelta
from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.utils import timezone
from rest_framework.test import APIClient

from apps.catalog.models import Bus, City, Route, Trip

from .models import Booking, BookingSeat

User = get_user_model()

BOOKINGS_URL = "/api/v1/bookings/"
MINE_URL = "/api/v1/bookings/mine/"


@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="cliente@example.com", password="S3guro-y-largo!",
        first_name="Luis", last_name="Quispe",
    )


@pytest.fixture
def other_user(db):
    return User.objects.create_user(
        email="otro@example.com", password="S3guro-y-largo!",
        first_name="Rosa", last_name="Mamani",
    )


@pytest.fixture
def client(user) -> APIClient:
    api_client = APIClient()
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def trip(db) -> Trip:
    lima = City.objects.create(name="Lima", region="Lima")
    ica = City.objects.create(name="Ica", region="Ica")
    route = Route.objects.create(
        origin=lima, destination=ica, distance_km=300,
        duration_minutes=270, base_price=Decimal("39.00"),
    )
    bus = Bus.objects.create(
        plate="RTX-101", model="Scania Touring", seat_rows=10, seat_cols=4
    )
    departure = timezone.now() + timedelta(days=3)
    return Trip.objects.create(
        route=route, bus=bus, departure_at=departure,
        arrival_at=departure + timedelta(minutes=270), price=Decimal("39.00"),
    )


def booking_payload(trip: Trip, seat_numbers: list[int]) -> dict:
    return {
        "trip": trip.id,
        "seats": [
            {
                "seat_number": number,
                "passenger_name": f"Pasajero {number}",
                "passenger_document": f"4512879{number}",
            }
            for number in seat_numbers
        ],
    }


@pytest.mark.django_db
class TestCreateBooking:
    def test_requires_authentication(self, trip):
        response = APIClient().post(BOOKINGS_URL, booking_payload(trip, [1]), format="json")
        assert response.status_code == 401

    def test_creates_confirmed_booking_with_code_and_total(self, client, trip):
        response = client.post(BOOKINGS_URL, booking_payload(trip, [1, 2]), format="json")

        assert response.status_code == 201
        data = response.json()["data"]
        assert data["code"].startswith("RTX-")
        assert data["status"] == "confirmed"
        assert Decimal(data["total"]) == Decimal("78.00")
        assert len(data["seats"]) == 2
        assert BookingSeat.objects.filter(trip=trip).count() == 2

    def test_rejects_seat_outside_bus_layout(self, client, trip):
        response = client.post(BOOKINGS_URL, booking_payload(trip, [41]), format="json")

        assert response.status_code == 400
        assert response.json()["error"]["code"] == "validation_error"

    def test_rejects_duplicate_seats_in_same_request(self, client, trip):
        response = client.post(BOOKINGS_URL, booking_payload(trip, [5, 5]), format="json")
        assert response.status_code == 400

    def test_rejects_past_trip(self, client, trip):
        trip.departure_at = timezone.now() - timedelta(hours=1)
        trip.save(update_fields=["departure_at"])

        response = client.post(BOOKINGS_URL, booking_payload(trip, [1]), format="json")
        assert response.status_code == 400

    def test_conflict_when_seat_already_taken(self, client, other_user, trip):
        first = APIClient()
        first.force_authenticate(user=other_user)
        assert first.post(
            BOOKINGS_URL, booking_payload(trip, [7]), format="json"
        ).status_code == 201

        response = client.post(BOOKINGS_URL, booking_payload(trip, [7]), format="json")

        assert response.status_code == 409
        body = response.json()
        assert body["success"] is False
        assert body["error"]["code"] == "seat_taken"

    def test_db_constraint_blocks_double_seat_directly(self, user, other_user, trip):
        """Last line of defense: UNIQUE(trip, seat_number) at the DB level."""
        booking_a = Booking.objects.create(
            user=user, trip=trip, code="RTX-AAAAAA", total=Decimal("39.00")
        )
        booking_b = Booking.objects.create(
            user=other_user, trip=trip, code="RTX-BBBBBB", total=Decimal("39.00")
        )
        BookingSeat.objects.create(
            booking=booking_a, trip=trip, seat_number=1,
            passenger_name="A", passenger_document="1",
        )
        with pytest.raises(IntegrityError):
            BookingSeat.objects.create(
                booking=booking_b, trip=trip, seat_number=1,
                passenger_name="B", passenger_document="2",
            )


@pytest.mark.django_db
class TestReadBookings:
    def test_mine_lists_only_own_bookings(self, client, user, other_user, trip):
        client.post(BOOKINGS_URL, booking_payload(trip, [1]), format="json")
        other = APIClient()
        other.force_authenticate(user=other_user)
        other.post(BOOKINGS_URL, booking_payload(trip, [2]), format="json")

        response = client.get(MINE_URL)

        items = response.json()["data"]["items"]
        assert len(items) == 1
        assert items[0]["seats"][0]["seat_number"] == 1

    def test_detail_by_code_is_owner_only(self, client, other_user, trip):
        created = client.post(BOOKINGS_URL, booking_payload(trip, [3]), format="json")
        code = created.json()["data"]["code"]

        assert client.get(f"{BOOKINGS_URL}{code}/").status_code == 200

        other = APIClient()
        other.force_authenticate(user=other_user)
        assert other.get(f"{BOOKINGS_URL}{code}/").status_code == 404


@pytest.mark.django_db
class TestSeatMapIntegration:
    def test_taken_seats_appear_in_catalog_seat_map(self, client, trip):
        client.post(BOOKINGS_URL, booking_payload(trip, [4, 8]), format="json")

        response = APIClient().get(f"/api/v1/trips/{trip.id}/seats/")

        assert response.json()["data"]["taken"] == [4, 8]
