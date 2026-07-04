"""Booking endpoints: create, mine, detail by code."""
from rest_framework import generics, permissions

from .models import Booking
from .serializers import BookingCreateSerializer, BookingSerializer


class BookingCreateView(generics.CreateAPIView):
    serializer_class = BookingCreateSerializer
    permission_classes = (permissions.IsAuthenticated,)


class MyBookingsView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return (
            Booking.objects.filter(user=self.request.user)
            .select_related("trip__route__origin", "trip__route__destination", "trip__bus")
            .prefetch_related("seats")
        )


class BookingDetailView(generics.RetrieveAPIView):
    serializer_class = BookingSerializer
    permission_classes = (permissions.IsAuthenticated,)
    lookup_field = "code"

    def get_queryset(self):
        # Owner-only: unknown codes and other users' codes both 404.
        return (
            Booking.objects.filter(user=self.request.user)
            .select_related("trip__route__origin", "trip__route__destination", "trip__bus")
            .prefetch_related("seats")
        )
