"""Booking creation: transactional, double-booking-proof."""
import secrets

from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework import serializers

from apps.catalog.models import Trip

from .exceptions import SeatTakenError
from .models import Booking, BookingSeat

# Unambiguous alphabet (no O/0, I/1/L) for human-readable ticket codes.
CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
CODE_LENGTH = 6


def generate_booking_code() -> str:
    suffix = "".join(secrets.choice(CODE_ALPHABET) for _ in range(CODE_LENGTH))
    return f"RTX-{suffix}"


def create_booking(*, user, trip: Trip, seats: list[dict]) -> Booking:
    """Reserve seats atomically.

    Locks the trip row so concurrent requests for the same trip serialize;
    the UNIQUE(trip, seat_number) constraint is the last line of defense.
    """
    with transaction.atomic():
        locked_trip = (
            Trip.objects.select_for_update().select_related("bus").get(pk=trip.pk)
        )

        if locked_trip.departure_at <= timezone.now():
            raise serializers.ValidationError(
                {"trip": "Este viaje ya partió; elige otra fecha."}
            )
        if locked_trip.status != Trip.Status.SCHEDULED:
            raise serializers.ValidationError({"trip": "Este viaje no está disponible."})

        requested = [seat["seat_number"] for seat in seats]
        already_taken = set(
            locked_trip.booked_seats.filter(
                seat_number__in=requested,
                booking__status__in=(Booking.Status.PENDING, Booking.Status.CONFIRMED),
            ).values_list("seat_number", flat=True)
        )
        if already_taken:
            raise SeatTakenError(sorted(already_taken))

        booking = Booking.objects.create(
            user=user,
            trip=locked_trip,
            code=generate_booking_code(),
            total=locked_trip.price * len(seats),
        )
        try:
            BookingSeat.objects.bulk_create(
                BookingSeat(booking=booking, trip=locked_trip, **seat) for seat in seats
            )
        except IntegrityError as exc:
            # Race lost despite the lock (e.g. non-locking backends): constraint wins.
            raise SeatTakenError(requested) from exc

        return booking
