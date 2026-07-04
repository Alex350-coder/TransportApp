from django.urls import path

from .views import MyShipmentsView, PublicTrackingView, QuoteView, ShipmentCreateView

urlpatterns = [
    path("", ShipmentCreateView.as_view(), name="parcel-create"),
    path("quote/", QuoteView.as_view(), name="parcel-quote"),
    path("mine/", MyShipmentsView.as_view(), name="parcel-mine"),
    path("track/<str:code>/", PublicTrackingView.as_view(), name="parcel-track"),
]
