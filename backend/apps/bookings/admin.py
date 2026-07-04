from django.contrib import admin

from .models import Booking, BookingSeat


class BookingSeatInline(admin.TabularInline):
    model = BookingSeat
    extra = 0
    readonly_fields = ("trip",)


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("code", "user", "trip", "status", "total", "created_at")
    list_select_related = ("user", "trip__route__origin", "trip__route__destination")
    search_fields = ("code", "user__email")
    list_filter = ("status",)
    inlines = (BookingSeatInline,)
