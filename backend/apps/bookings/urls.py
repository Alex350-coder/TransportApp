from django.urls import path

from .views import BookingCreateView, BookingDetailView, MyBookingsView

urlpatterns = [
    path("", BookingCreateView.as_view(), name="booking-create"),
    path("mine/", MyBookingsView.as_view(), name="booking-mine"),
    path("<str:code>/", BookingDetailView.as_view(), name="booking-detail"),
]
