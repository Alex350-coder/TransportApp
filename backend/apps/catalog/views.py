"""Catalog endpoints: cities, trip search, seat map."""
from django.utils import timezone
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import City, Trip
from .selectors import taken_seat_numbers
from .serializers import CitySerializer, TripSerializer


class CityListView(generics.ListAPIView):
    queryset = City.objects.all()
    serializer_class = CitySerializer
    pagination_class = None  # Small, bounded list used to fill search selects.


class TripSearchView(generics.ListAPIView):
    serializer_class = TripSerializer

    def get_queryset(self):
        queryset = (
            Trip.objects.filter(
                status=Trip.Status.SCHEDULED, departure_at__gte=timezone.now()
            )
            .select_related("route__origin", "route__destination", "bus")
            .order_by("departure_at")
        )
        params = self.request.query_params
        if origin := params.get("origin"):
            queryset = queryset.filter(route__origin_id=origin)
        if destination := params.get("destination"):
            queryset = queryset.filter(route__destination_id=destination)
        if date := params.get("date"):
            queryset = queryset.filter(departure_at__date=date)
        return queryset


class TripSeatsView(APIView):
    def get(self, request, pk: int) -> Response:
        try:
            trip = Trip.objects.select_related("bus").get(pk=pk)
        except Trip.DoesNotExist:
            from rest_framework.exceptions import NotFound

            raise NotFound("El viaje no existe.")

        bus = trip.bus
        return Response(
            {
                "trip_id": trip.id,
                "layout": {
                    "rows": bus.seat_rows,
                    "cols": bus.seat_cols,
                    "aisle_after_col": bus.aisle_after_col,
                },
                "seats_total": bus.seats_total,
                "taken": taken_seat_numbers(trip),
            }
        )
