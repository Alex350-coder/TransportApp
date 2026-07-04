from django.contrib import admin

from .models import Shipment, TrackingEvent
from .services import advance_shipment


class TrackingEventInline(admin.TabularInline):
    model = TrackingEvent
    extra = 0
    readonly_fields = ("created_at",)


@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = (
        "tracking_code", "sender", "origin", "destination",
        "status", "price", "created_at",
    )
    list_select_related = ("sender", "origin", "destination")
    search_fields = ("tracking_code", "sender__email", "recipient_name")
    list_filter = ("status",)
    inlines = (TrackingEventInline,)
    actions = ("advance_status",)

    @admin.action(description="Avanzar al siguiente estado")
    def advance_status(self, request, queryset):
        advanced = sum(int(advance_shipment(shipment)) for shipment in queryset)
        self.message_user(request, f"{advanced} encomienda(s) avanzaron de estado.")
