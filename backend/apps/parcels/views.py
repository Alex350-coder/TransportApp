"""Parcel endpoints: quote, create, mine, public tracking."""
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.throttles import TrackingRateThrottle

from .models import Shipment
from .serializers import (
    PublicTrackingSerializer,
    QuoteSerializer,
    ShipmentCreateSerializer,
    ShipmentSerializer,
)


class QuoteView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request) -> Response:
        serializer = QuoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.quote())


class ShipmentCreateView(generics.CreateAPIView):
    serializer_class = ShipmentCreateSerializer
    permission_classes = (permissions.IsAuthenticated,)


class MyShipmentsView(generics.ListAPIView):
    serializer_class = ShipmentSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Shipment.objects.filter(sender=self.request.user).select_related(
            "origin", "destination"
        )


class PublicTrackingView(generics.RetrieveAPIView):
    serializer_class = PublicTrackingSerializer
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (TrackingRateThrottle,)
    lookup_field = "tracking_code"
    lookup_url_kwarg = "code"
    queryset = Shipment.objects.select_related("origin", "destination").prefetch_related(
        "events"
    )
