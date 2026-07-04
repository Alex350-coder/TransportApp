"""Bookings: a reservation of one or more seats on a trip."""
from django.conf import settings
from django.db import models

from apps.catalog.models import Trip


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pendiente"
        CONFIRMED = "confirmed", "Confirmada"
        CANCELLED = "cancelled", "Cancelada"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="bookings"
    )
    trip = models.ForeignKey(Trip, on_delete=models.PROTECT, related_name="bookings")
    status = models.CharField(
        "estado", max_length=12, choices=Status.choices, default=Status.CONFIRMED
    )
    code = models.CharField("código", max_length=12, unique=True)
    total = models.DecimalField("total", max_digits=9, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        verbose_name = "reserva"

    def __str__(self) -> str:
        return self.code


class BookingSeat(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="seats")
    # Denormalized trip FK so the uniqueness invariant lives in the DB schema.
    trip = models.ForeignKey(Trip, on_delete=models.PROTECT, related_name="booked_seats")
    seat_number = models.PositiveSmallIntegerField("asiento")
    passenger_name = models.CharField("pasajero", max_length=150)
    passenger_document = models.CharField("documento", max_length=20)

    class Meta:
        verbose_name = "asiento reservado"
        constraints = [
            models.UniqueConstraint(fields=("trip", "seat_number"), name="unique_trip_seat"),
        ]

    def __str__(self) -> str:
        return f"{self.booking.code} · asiento {self.seat_number}"
