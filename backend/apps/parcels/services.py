"""Parcel pricing and shipment lifecycle."""
import math
import secrets
from decimal import Decimal

from django.db import transaction
from django.db.models import Q
from rest_framework import serializers

from apps.catalog.models import City, Route

from .models import Shipment, TrackingEvent

BASE_PRICE = Decimal("10.00")
PRICE_PER_100KM = Decimal("3.00")
KM_PER_DELIVERY_DAY = 800

# (max weight in kg, price multiplier)
WEIGHT_TIERS = (
    (Decimal("1"), Decimal("1.0")),
    (Decimal("5"), Decimal("1.5")),
    (Decimal("20"), Decimal("2.5")),
)
OVERSIZE_MULTIPLIER = Decimal("4.0")

CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
CODE_LENGTH = 6

STATUS_FLOW = (
    Shipment.Status.REGISTERED,
    Shipment.Status.IN_TRANSIT,
    Shipment.Status.AT_DESTINATION,
    Shipment.Status.DELIVERED,
)

EVENT_DESCRIPTIONS = {
    Shipment.Status.REGISTERED: "Encomienda registrada en agencia RUTEX.",
    Shipment.Status.IN_TRANSIT: "Encomienda en tránsito hacia su destino.",
    Shipment.Status.AT_DESTINATION: "Encomienda llegó a la agencia de destino.",
    Shipment.Status.DELIVERED: "Encomienda entregada al destinatario.",
}


def weight_multiplier(weight_kg: Decimal) -> Decimal:
    for max_weight, multiplier in WEIGHT_TIERS:
        if weight_kg <= max_weight:
            return multiplier
    return OVERSIZE_MULTIPLIER


def quote_price(*, distance_km: int, weight_kg: Decimal) -> Decimal:
    distance_blocks = math.ceil(distance_km / 100)
    distance_price = BASE_PRICE + PRICE_PER_100KM * distance_blocks
    return (distance_price * weight_multiplier(weight_kg)).quantize(Decimal("0.01"))


def find_route(origin: City, destination: City) -> Route:
    """Coverage between two cities, in either direction."""
    route = Route.objects.filter(
        Q(origin=origin, destination=destination)
        | Q(origin=destination, destination=origin)
    ).first()
    if route is None:
        raise serializers.ValidationError(
            {"destination": "Aún no tenemos cobertura entre esas ciudades."}
        )
    return route


def estimated_days(distance_km: int) -> int:
    return max(1, math.ceil(distance_km / KM_PER_DELIVERY_DAY))


def generate_tracking_code() -> str:
    suffix = "".join(secrets.choice(CODE_ALPHABET) for _ in range(CODE_LENGTH))
    return f"RTX-ENV-{suffix}"


def create_shipment(*, sender, origin: City, destination: City,
                    weight_kg: Decimal, **recipient_fields) -> Shipment:
    route = find_route(origin, destination)
    with transaction.atomic():
        shipment = Shipment.objects.create(
            sender=sender,
            origin=origin,
            destination=destination,
            weight_kg=weight_kg,
            price=quote_price(distance_km=route.distance_km, weight_kg=weight_kg),
            tracking_code=generate_tracking_code(),
            **recipient_fields,
        )
        TrackingEvent.objects.create(
            shipment=shipment,
            status=Shipment.Status.REGISTERED,
            description=EVENT_DESCRIPTIONS[Shipment.Status.REGISTERED],
            location=origin.name,
        )
    return shipment


def advance_shipment(shipment: Shipment) -> bool:
    """Move to the next status in the flow. Returns False when already final."""
    current_index = STATUS_FLOW.index(Shipment.Status(shipment.status))
    if current_index == len(STATUS_FLOW) - 1:
        return False

    next_status = STATUS_FLOW[current_index + 1]
    location = (
        shipment.destination.name
        if next_status in (Shipment.Status.AT_DESTINATION, Shipment.Status.DELIVERED)
        else ""
    )
    with transaction.atomic():
        shipment.status = next_status
        shipment.save(update_fields=["status"])
        TrackingEvent.objects.create(
            shipment=shipment,
            status=next_status,
            description=EVENT_DESCRIPTIONS[next_status],
            location=location,
        )
    return True
