"""Scoped throttles for sensitive endpoints."""
from rest_framework.throttling import AnonRateThrottle


class AuthRateThrottle(AnonRateThrottle):
    scope = "auth"


class TrackingRateThrottle(AnonRateThrottle):
    scope = "tracking"
