"""Catalog serializers."""
from rest_framework import serializers

from .models import Bus, City, Route, Trip


class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ("id", "name", "region")


class RouteSerializer(serializers.ModelSerializer):
    origin = CitySerializer(read_only=True)
    destination = CitySerializer(read_only=True)

    class Meta:
        model = Route
        fields = ("id", "origin", "destination", "distance_km", "duration_minutes")


class BusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bus
        fields = ("id", "model", "seat_rows", "seat_cols", "aisle_after_col")


class TripSerializer(serializers.ModelSerializer):
    route = RouteSerializer(read_only=True)
    bus = BusSerializer(read_only=True)
    seats_total = serializers.IntegerField(source="bus.seats_total", read_only=True)
    seats_taken = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Trip
        fields = (
            "id",
            "route",
            "bus",
            "departure_at",
            "arrival_at",
            "price",
            "status",
            "seats_total",
            "seats_taken",
        )
