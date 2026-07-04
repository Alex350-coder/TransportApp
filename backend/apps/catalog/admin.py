from django.contrib import admin

from .models import Bus, City, Route, Trip


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ("name", "region")
    search_fields = ("name",)


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ("origin", "destination", "distance_km", "duration_minutes", "base_price")
    list_select_related = ("origin", "destination")
    list_filter = ("origin",)


@admin.register(Bus)
class BusAdmin(admin.ModelAdmin):
    list_display = ("plate", "model", "seat_rows", "seat_cols")


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ("route", "bus", "departure_at", "price", "status")
    list_select_related = ("route__origin", "route__destination", "bus")
    list_filter = ("status", "route__origin")
    date_hierarchy = "departure_at"
