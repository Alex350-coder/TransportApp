"""Root URL configuration."""
from django.conf import settings
from django.contrib import admin
from django.urls import include, path

api_v1_patterns = [
    path("auth/", include("apps.accounts.urls")),
    path("", include("apps.catalog.urls")),
    path("bookings/", include("apps.bookings.urls")),
    path("parcels/", include("apps.parcels.urls")),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include(api_v1_patterns)),
]

# API schema/docs are a recon aid in production; expose them in dev only.
if settings.DEBUG:
    from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

    urlpatterns += [
        path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
        path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    ]
