"""Parcels: shipments with a public tracking timeline."""
from django.conf import settings
from django.db import models

from apps.catalog.models import City


class Shipment(models.Model):
    class Status(models.TextChoices):
        REGISTERED = "registered", "Registrado"
        IN_TRANSIT = "in_transit", "En tránsito"
        AT_DESTINATION = "at_destination", "En destino"
        DELIVERED = "delivered", "Entregado"

    tracking_code = models.CharField("código de rastreo", max_length=16, unique=True)
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="shipments"
    )
    recipient_name = models.CharField("destinatario", max_length=150)
    recipient_document = models.CharField("documento", max_length=20)
    recipient_phone = models.CharField("teléfono", max_length=20, blank=True)
    origin = models.ForeignKey(
        City, on_delete=models.PROTECT, related_name="shipments_from", verbose_name="origen"
    )
    destination = models.ForeignKey(
        City, on_delete=models.PROTECT, related_name="shipments_to", verbose_name="destino"
    )
    weight_kg = models.DecimalField("peso (kg)", max_digits=6, decimal_places=2)
    price = models.DecimalField("precio", max_digits=8, decimal_places=2)
    status = models.CharField(
        "estado", max_length=16, choices=Status.choices, default=Status.REGISTERED
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        verbose_name = "encomienda"

    def __str__(self) -> str:
        return self.tracking_code


class TrackingEvent(models.Model):
    shipment = models.ForeignKey(Shipment, on_delete=models.CASCADE, related_name="events")
    status = models.CharField("estado", max_length=16, choices=Shipment.Status.choices)
    description = models.CharField("descripción", max_length=255)
    location = models.CharField("ubicación", max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("created_at",)
        verbose_name = "evento de rastreo"

    def __str__(self) -> str:
        return f"{self.shipment} · {self.get_status_display()}"
