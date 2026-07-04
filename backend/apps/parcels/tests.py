"""Parcels API tests: quote, create, mine, public tracking."""
from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.catalog.models import City, Route

from .models import Shipment, TrackingEvent
from .services import advance_shipment, quote_price

User = get_user_model()

QUOTE_URL = "/api/v1/parcels/quote/"
PARCELS_URL = "/api/v1/parcels/"
MINE_URL = "/api/v1/parcels/mine/"


@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="remitente@example.com", password="S3guro-y-largo!",
        first_name="Carla", last_name="Rojas",
    )


@pytest.fixture
def client(user) -> APIClient:
    api_client = APIClient()
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def cities(db) -> dict[str, City]:
    lima = City.objects.create(name="Lima", region="Lima")
    cusco = City.objects.create(name="Cusco", region="Cusco")
    Route.objects.create(
        origin=lima, destination=cusco, distance_km=1105,
        duration_minutes=1260, base_price=Decimal("99.00"),
    )
    return {"lima": lima, "cusco": cusco}


def shipment_payload(cities: dict) -> dict:
    return {
        "origin": cities["lima"].id,
        "destination": cities["cusco"].id,
        "weight_kg": "4.50",
        "recipient_name": "Jorge Huamán",
        "recipient_document": "45128799",
        "recipient_phone": "+51 988 777 666",
    }


class TestPricing:
    def test_price_formula_with_weight_tier(self):
        # base 10 + 3 per 100km started (1105km -> 12 tramos = 36) = 46; tier <=5kg x1.5
        assert quote_price(distance_km=1105, weight_kg=Decimal("4.5")) == Decimal("69.00")

    def test_light_parcel_uses_base_tier(self):
        # base 10 + 3*3 tramos (300km) = 19; tier <=1kg x1
        assert quote_price(distance_km=300, weight_kg=Decimal("0.8")) == Decimal("19.00")


@pytest.mark.django_db
class TestQuoteEndpoint:
    def test_quotes_price_for_covered_route(self, cities):
        response = APIClient().post(
            QUOTE_URL,
            {"origin": cities["lima"].id, "destination": cities["cusco"].id,
             "weight_kg": "4.50"},
            format="json",
        )

        assert response.status_code == 200
        data = response.json()["data"]
        assert Decimal(data["price"]) == Decimal("69.00")
        assert data["currency"] == "PEN"
        assert data["estimated_days"] >= 1

    def test_rejects_uncovered_route(self, cities, db):
        tacna = City.objects.create(name="Tacna", region="Tacna")
        response = APIClient().post(
            QUOTE_URL,
            {"origin": cities["lima"].id, "destination": tacna.id, "weight_kg": "1.0"},
            format="json",
        )

        assert response.status_code == 400


@pytest.mark.django_db
class TestCreateShipment:
    def test_requires_authentication(self, cities):
        response = APIClient().post(PARCELS_URL, shipment_payload(cities), format="json")
        assert response.status_code == 401

    def test_creates_shipment_with_code_price_and_initial_event(self, client, cities):
        response = client.post(PARCELS_URL, shipment_payload(cities), format="json")

        assert response.status_code == 201
        data = response.json()["data"]
        assert data["tracking_code"].startswith("RTX-ENV-")
        assert Decimal(data["price"]) == Decimal("69.00")
        assert data["status"] == "registered"

        shipment = Shipment.objects.get(tracking_code=data["tracking_code"])
        assert shipment.events.count() == 1
        assert shipment.events.first().status == "registered"

    def test_mine_lists_only_own_shipments(self, client, cities, db):
        client.post(PARCELS_URL, shipment_payload(cities), format="json")
        stranger = User.objects.create_user(
            email="otra@example.com", password="S3guro-y-largo!",
            first_name="Eva", last_name="Luna",
        )
        other_client = APIClient()
        other_client.force_authenticate(user=stranger)

        assert len(client.get(MINE_URL).json()["data"]["items"]) == 1
        assert other_client.get(MINE_URL).json()["data"]["items"] == []


@pytest.mark.django_db
class TestTracking:
    def test_public_tracking_returns_timeline(self, client, cities):
        created = client.post(PARCELS_URL, shipment_payload(cities), format="json")
        code = created.json()["data"]["tracking_code"]

        response = APIClient().get(f"/api/v1/parcels/track/{code}/")

        assert response.status_code == 200
        data = response.json()["data"]
        assert data["tracking_code"] == code
        assert data["origin"]["name"] == "Lima"
        assert len(data["events"]) == 1
        # Public payload must not leak sender or recipient contact details.
        assert "recipient_document" not in data
        assert "sender" not in data

    def test_unknown_code_is_404(self, db):
        response = APIClient().get("/api/v1/parcels/track/RTX-ENV-ZZZZZZ/")
        assert response.status_code == 404


@pytest.mark.django_db
class TestAdvanceShipment:
    def test_advances_through_status_flow_creating_events(self, client, cities):
        created = client.post(PARCELS_URL, shipment_payload(cities), format="json")
        shipment = Shipment.objects.get(
            tracking_code=created.json()["data"]["tracking_code"]
        )

        advance_shipment(shipment)
        shipment.refresh_from_db()
        assert shipment.status == Shipment.Status.IN_TRANSIT
        assert shipment.events.count() == 2

        advance_shipment(shipment)
        advance_shipment(shipment)
        shipment.refresh_from_db()
        assert shipment.status == Shipment.Status.DELIVERED
        assert shipment.events.count() == 4

    def test_delivered_shipment_does_not_advance(self, client, cities):
        created = client.post(PARCELS_URL, shipment_payload(cities), format="json")
        shipment = Shipment.objects.get(
            tracking_code=created.json()["data"]["tracking_code"]
        )
        for _ in range(3):
            advance_shipment(shipment)

        result = advance_shipment(shipment)

        shipment.refresh_from_db()
        assert result is False
        assert shipment.status == Shipment.Status.DELIVERED
        assert shipment.events.count() == 4
