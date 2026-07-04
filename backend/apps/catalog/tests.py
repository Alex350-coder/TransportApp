"""Catalog API tests: cities, trip search, seat map."""
from datetime import timedelta
from decimal import Decimal

import pytest
from django.core.management import call_command
from django.db import IntegrityError
from django.utils import timezone
from rest_framework.test import APIClient

from .models import Bus, City, Route, Trip

CITIES_URL = "/api/v1/cities/"
TRIPS_URL = "/api/v1/trips/"


@pytest.fixture
def client() -> APIClient:
    return APIClient()


@pytest.fixture
def cities(db) -> dict[str, City]:
    lima = City.objects.create(name="Lima", region="Lima")
    arequipa = City.objects.create(name="Arequipa", region="Arequipa")
    cusco = City.objects.create(name="Cusco", region="Cusco")
    return {"lima": lima, "arequipa": arequipa, "cusco": cusco}


@pytest.fixture
def bus(db) -> Bus:
    return Bus.objects.create(
        plate="ABC-123", model="Scania Touring", seat_rows=10, seat_cols=4, aisle_after_col=2
    )


@pytest.fixture
def route(cities) -> Route:
    return Route.objects.create(
        origin=cities["lima"],
        destination=cities["arequipa"],
        distance_km=1010,
        duration_minutes=960,
        base_price=Decimal("89.00"),
    )


@pytest.fixture
def trip(route, bus) -> Trip:
    departure = timezone.now() + timedelta(days=2)
    return Trip.objects.create(
        route=route,
        bus=bus,
        departure_at=departure,
        arrival_at=departure + timedelta(minutes=route.duration_minutes),
        price=Decimal("95.00"),
    )


@pytest.mark.django_db
class TestCities:
    def test_lists_cities_alphabetically(self, client, cities):
        response = client.get(CITIES_URL)

        assert response.status_code == 200
        names = [c["name"] for c in response.json()["data"]]
        assert names == ["Arequipa", "Cusco", "Lima"]


@pytest.mark.django_db
class TestRouteModel:
    def test_rejects_same_origin_and_destination(self, cities):
        with pytest.raises(IntegrityError):
            Route.objects.create(
                origin=cities["lima"],
                destination=cities["lima"],
                distance_km=0,
                duration_minutes=0,
                base_price=Decimal("10.00"),
            )


@pytest.mark.django_db
class TestTripSearch:
    def test_finds_trip_by_origin_destination_date(self, client, trip, cities):
        # The API filters by dates in the project timezone (America/Lima).
        date = timezone.localtime(trip.departure_at).date().isoformat()
        response = client.get(
            TRIPS_URL,
            {
                "origin": cities["lima"].id,
                "destination": cities["arequipa"].id,
                "date": date,
            },
        )

        assert response.status_code == 200
        items = response.json()["data"]["items"]
        assert len(items) == 1
        assert items[0]["route"]["origin"]["name"] == "Lima"
        assert items[0]["seats_total"] == 40

    def test_excludes_other_dates(self, client, trip, cities):
        other_date = (
            (timezone.localtime(trip.departure_at) + timedelta(days=1)).date().isoformat()
        )
        response = client.get(
            TRIPS_URL,
            {
                "origin": cities["lima"].id,
                "destination": cities["arequipa"].id,
                "date": other_date,
            },
        )

        assert response.json()["data"]["items"] == []

    def test_excludes_past_and_cancelled_trips(self, client, route, bus, cities):
        past = timezone.now() - timedelta(days=1)
        Trip.objects.create(
            route=route, bus=bus, departure_at=past,
            arrival_at=past + timedelta(hours=16), price=Decimal("95.00"),
        )
        future = timezone.now() + timedelta(days=3)
        Trip.objects.create(
            route=route, bus=bus, departure_at=future,
            arrival_at=future + timedelta(hours=16), price=Decimal("95.00"),
            status=Trip.Status.CANCELLED,
        )

        response = client.get(
            TRIPS_URL,
            {"origin": cities["lima"].id, "destination": cities["arequipa"].id},
        )

        assert response.json()["data"]["items"] == []


@pytest.mark.django_db
class TestSeedDemo:
    def test_seeds_catalog_and_is_idempotent(self):
        call_command("seed_demo")

        assert City.objects.count() == 10
        assert Route.objects.count() == 20
        assert Bus.objects.count() == 5
        first_run_trips = Trip.objects.count()
        assert first_run_trips > 0

        call_command("seed_demo")

        assert Trip.objects.count() == first_run_trips


@pytest.mark.django_db
class TestSeatMap:
    def test_returns_layout_and_no_taken_seats(self, client, trip):
        response = client.get(f"{TRIPS_URL}{trip.id}/seats/")

        assert response.status_code == 200
        data = response.json()["data"]
        assert data["layout"] == {"rows": 10, "cols": 4, "aisle_after_col": 2}
        assert data["seats_total"] == 40
        assert data["taken"] == []

    def test_404_for_unknown_trip(self, client, db):
        response = client.get(f"{TRIPS_URL}9999/seats/")
        assert response.status_code == 404
