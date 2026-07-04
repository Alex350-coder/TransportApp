from django.urls import path

from .views import CityListView, TripSearchView, TripSeatsView

urlpatterns = [
    path("cities/", CityListView.as_view(), name="city-list"),
    path("trips/", TripSearchView.as_view(), name="trip-search"),
    path("trips/<int:pk>/seats/", TripSeatsView.as_view(), name="trip-seats"),
]
