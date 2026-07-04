"""Booking serializers."""
from rest_framework import serializers

from apps.catalog.serializers import TripSerializer

from .models import Booking, BookingSeat
from .services import create_booking


class BookingSeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingSeat
        fields = ("seat_number", "passenger_name", "passenger_document")


class BookingSerializer(serializers.ModelSerializer):
    trip = TripSerializer(read_only=True)
    seats = BookingSeatSerializer(many=True, read_only=True)

    class Meta:
        model = Booking
        fields = ("id", "code", "status", "total", "created_at", "trip", "seats")
        read_only_fields = fields


class BookingCreateSerializer(serializers.Serializer):
    trip = serializers.PrimaryKeyRelatedField(
        queryset=Booking.trip.field.related_model.objects.select_related("bus")
    )
    seats = BookingSeatSerializer(many=True, allow_empty=False, max_length=10)

    def validate(self, attrs: dict) -> dict:
        trip = attrs["trip"]
        seat_numbers = [seat["seat_number"] for seat in attrs["seats"]]

        if len(seat_numbers) != len(set(seat_numbers)):
            raise serializers.ValidationError(
                {"seats": "Hay asientos repetidos en la solicitud."}
            )

        invalid = [n for n in seat_numbers if n < 1 or n > trip.bus.seats_total]
        if invalid:
            raise serializers.ValidationError(
                {"seats": f"Asientos fuera del plano del bus: {invalid}."}
            )
        return attrs

    def create(self, validated_data: dict) -> Booking:
        return create_booking(
            user=self.context["request"].user,
            trip=validated_data["trip"],
            seats=validated_data["seats"],
        )

    def to_representation(self, instance: Booking) -> dict:
        return BookingSerializer(instance, context=self.context).data
