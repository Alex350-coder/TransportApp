"""Query helpers shared across catalog views."""
from .models import Trip


def taken_seat_numbers(trip: Trip) -> list[int]:
    """Seat numbers already reserved for a trip.

    Reads through the bookings app reverse relation; returns an empty list
    until bookings exist (relation is added by apps.bookings.BookingSeat).
    """
    if not hasattr(trip, "booked_seats"):
        return []
    return sorted(
        trip.booked_seats.filter(booking__status__in=("pending", "confirmed"))
        .values_list("seat_number", flat=True)
    )
