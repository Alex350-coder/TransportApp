"""Parcel serializers: quote, shipment CRUD, public tracking."""
from decimal import Decimal

from rest_framework import serializers

from apps.catalog.models import City
from apps.catalog.serializers import CitySerializer

from .models import Shipment, TrackingEvent
from .services import create_shipment, estimated_days, find_route, quote_price

MAX_WEIGHT_KG = Decimal("50")


class QuoteSerializer(serializers.Serializer):
    origin = serializers.PrimaryKeyRelatedField(queryset=City.objects.all())
    destination = serializers.PrimaryKeyRelatedField(queryset=City.objects.all())
    weight_kg = serializers.DecimalField(
        max_digits=6, decimal_places=2, min_value=Decimal("0.01"),
        max_value=MAX_WEIGHT_KG,
    )

    def quote(self) -> dict:
        route = find_route(
            self.validated_data["origin"], self.validated_data["destination"]
        )
        return {
            "price": quote_price(
                distance_km=route.distance_km,
                weight_kg=self.validated_data["weight_kg"],
            ),
            "currency": "PEN",
            "estimated_days": estimated_days(route.distance_km),
        }


class TrackingEventSerializer(serializers.ModelSerializer):
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = TrackingEvent
        fields = ("status", "status_label", "description", "location", "created_at")


class ShipmentSerializer(serializers.ModelSerializer):
    origin = CitySerializer(read_only=True)
    destination = CitySerializer(read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Shipment
        fields = (
            "id", "tracking_code", "status", "status_label", "origin", "destination",
            "weight_kg", "price", "recipient_name", "created_at",
        )
        read_only_fields = fields


class ShipmentCreateSerializer(serializers.ModelSerializer):
    origin = serializers.PrimaryKeyRelatedField(queryset=City.objects.all())
    destination = serializers.PrimaryKeyRelatedField(queryset=City.objects.all())
    weight_kg = serializers.DecimalField(
        max_digits=6, decimal_places=2, min_value=Decimal("0.01"),
        max_value=MAX_WEIGHT_KG,
    )

    class Meta:
        model = Shipment
        fields = (
            "origin", "destination", "weight_kg",
            "recipient_name", "recipient_document", "recipient_phone",
        )

    def create(self, validated_data: dict) -> Shipment:
        return create_shipment(sender=self.context["request"].user, **validated_data)

    def to_representation(self, instance: Shipment) -> dict:
        return ShipmentSerializer(instance, context=self.context).data


class PublicTrackingSerializer(serializers.ModelSerializer):
    """Public payload: no sender data, no recipient contact details."""

    origin = CitySerializer(read_only=True)
    destination = CitySerializer(read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    events = TrackingEventSerializer(many=True, read_only=True)

    class Meta:
        model = Shipment
        fields = (
            "tracking_code", "status", "status_label",
            "origin", "destination", "created_at", "events",
        )
        read_only_fields = fields
