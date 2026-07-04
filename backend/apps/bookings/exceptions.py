"""Booking-specific API exceptions."""
from rest_framework import status
from rest_framework.exceptions import APIException


class SeatTakenError(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_code = "seat_taken"

    def __init__(self, seat_numbers: list[int]):
        seats = ", ".join(str(number) for number in seat_numbers)
        detail = (
            f"El asiento {seats} ya fue reservado por otra persona. "
            "Elige otro asiento, por favor."
            if len(seat_numbers) == 1
            else f"Los asientos {seats} ya fueron reservados por otra persona. "
            "Elige otros asientos, por favor."
        )
        super().__init__(detail=detail, code=self.default_code)
