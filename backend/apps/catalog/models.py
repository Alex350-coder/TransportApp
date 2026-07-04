"""Catalog domain: cities, routes, buses, trips."""
from django.db import models


class City(models.Model):
    name = models.CharField("nombre", max_length=100, unique=True)
    region = models.CharField("región", max_length=100)

    class Meta:
        ordering = ("name",)
        verbose_name = "ciudad"
        verbose_name_plural = "ciudades"

    def __str__(self) -> str:
        return self.name


class Route(models.Model):
    origin = models.ForeignKey(
        City, on_delete=models.PROTECT, related_name="routes_from", verbose_name="origen"
    )
    destination = models.ForeignKey(
        City, on_delete=models.PROTECT, related_name="routes_to", verbose_name="destino"
    )
    distance_km = models.PositiveIntegerField("distancia (km)")
    duration_minutes = models.PositiveIntegerField("duración (min)")
    base_price = models.DecimalField("precio base", max_digits=8, decimal_places=2)

    class Meta:
        verbose_name = "ruta"
        constraints = [
            models.UniqueConstraint(fields=("origin", "destination"), name="unique_route"),
            models.CheckConstraint(
                condition=~models.Q(origin=models.F("destination")),
                name="route_origin_not_destination",
            ),
        ]
        indexes = [models.Index(fields=("origin", "destination"))]

    def __str__(self) -> str:
        return f"{self.origin} → {self.destination}"


class Bus(models.Model):
    plate = models.CharField("placa", max_length=10, unique=True)
    model = models.CharField("modelo", max_length=100)
    seat_rows = models.PositiveSmallIntegerField("filas")
    seat_cols = models.PositiveSmallIntegerField("columnas")
    aisle_after_col = models.PositiveSmallIntegerField("pasillo después de columna", default=2)

    class Meta:
        verbose_name = "bus"
        verbose_name_plural = "buses"
        constraints = [
            models.CheckConstraint(
                condition=models.Q(aisle_after_col__lt=models.F("seat_cols")),
                name="bus_aisle_within_columns",
            ),
        ]

    @property
    def seats_total(self) -> int:
        return self.seat_rows * self.seat_cols

    def __str__(self) -> str:
        return f"{self.model} ({self.plate})"


class Trip(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = "scheduled", "Programado"
        CANCELLED = "cancelled", "Cancelado"
        COMPLETED = "completed", "Completado"

    route = models.ForeignKey(
        Route, on_delete=models.PROTECT, related_name="trips", verbose_name="ruta"
    )
    bus = models.ForeignKey(
        Bus, on_delete=models.PROTECT, related_name="trips", verbose_name="bus"
    )
    departure_at = models.DateTimeField("salida")
    arrival_at = models.DateTimeField("llegada")
    price = models.DecimalField("precio", max_digits=8, decimal_places=2)
    status = models.CharField(
        "estado", max_length=12, choices=Status.choices, default=Status.SCHEDULED
    )

    class Meta:
        ordering = ("departure_at",)
        verbose_name = "viaje"
        indexes = [models.Index(fields=("departure_at",))]

    def __str__(self) -> str:
        return f"{self.route} — {self.departure_at:%d/%m/%Y %H:%M}"
