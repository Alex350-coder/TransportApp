"""Idempotent demo seed: cities, routes, buses, and two weeks of trips."""
from datetime import time, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.catalog.models import Bus, City, Route, Trip

SEED_DAYS = 14
DAILY_DEPARTURES = (time(8, 0), time(21, 30))

CITIES = [
    ("Lima", "Lima"),
    ("Arequipa", "Arequipa"),
    ("Cusco", "Cusco"),
    ("Trujillo", "La Libertad"),
    ("Chiclayo", "Lambayeque"),
    ("Piura", "Piura"),
    ("Huancayo", "Junín"),
    ("Ica", "Ica"),
    ("Tacna", "Tacna"),
    ("Puno", "Puno"),
]

# (origin, destination, km, minutes, base price)
ROUTES = [
    ("Lima", "Arequipa", 1010, 960, "89.00"),
    ("Lima", "Cusco", 1105, 1260, "99.00"),
    ("Lima", "Trujillo", 560, 540, "59.00"),
    ("Lima", "Chiclayo", 770, 720, "69.00"),
    ("Lima", "Huancayo", 305, 420, "45.00"),
    ("Lima", "Ica", 300, 270, "39.00"),
    ("Arequipa", "Cusco", 480, 600, "55.00"),
    ("Arequipa", "Tacna", 370, 330, "42.00"),
    ("Cusco", "Puno", 390, 420, "49.00"),
    ("Trujillo", "Piura", 420, 390, "45.00"),
]

BUSES = [
    ("RTX-101", "Scania Touring HD", 10, 4, 2),
    ("RTX-102", "Volvo 9800", 10, 4, 2),
    ("RTX-103", "Mercedes-Benz Paradiso", 10, 4, 2),
    ("RTX-201", "Sprinter Ejecutivo", 5, 4, 2),
    ("RTX-202", "Sprinter Ejecutivo", 5, 4, 2),
]


class Command(BaseCommand):
    help = "Seed demo cities, routes, buses and trips (idempotent)."

    def handle(self, *args, **options):
        cities = {
            name: City.objects.get_or_create(name=name, defaults={"region": region})[0]
            for name, region in CITIES
        }

        buses = [
            Bus.objects.get_or_create(
                plate=plate,
                defaults={
                    "model": model,
                    "seat_rows": rows,
                    "seat_cols": cols,
                    "aisle_after_col": aisle,
                },
            )[0]
            for plate, model, rows, cols, aisle in BUSES
        ]

        routes = []
        for origin, destination, km, minutes, price in ROUTES:
            for a, b in ((origin, destination), (destination, origin)):
                route, _ = Route.objects.get_or_create(
                    origin=cities[a],
                    destination=cities[b],
                    defaults={
                        "distance_km": km,
                        "duration_minutes": minutes,
                        "base_price": Decimal(price),
                    },
                )
                routes.append(route)

        created = 0
        today = timezone.localdate()
        tz = timezone.get_current_timezone()
        for day_offset in range(1, SEED_DAYS + 1):
            date = today + timedelta(days=day_offset)
            for route_index, route in enumerate(routes):
                for slot_index, slot in enumerate(DAILY_DEPARTURES):
                    departure = timezone.make_aware(
                        timezone.datetime.combine(date, slot), tz
                    )
                    bus = buses[(route_index + slot_index + day_offset) % len(buses)]
                    _, was_created = Trip.objects.get_or_create(
                        route=route,
                        bus=bus,
                        departure_at=departure,
                        defaults={
                            "arrival_at": departure
                            + timedelta(minutes=route.duration_minutes),
                            "price": route.base_price,
                        },
                    )
                    created += int(was_created)

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed OK: {len(cities)} ciudades, {len(routes)} rutas, "
                f"{len(buses)} buses, {created} viajes nuevos."
            )
        )
