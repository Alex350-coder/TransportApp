"""Test settings: fast hashing, in-memory SQLite, no rate limiting."""
from .base import *  # noqa: F401,F403
from .base import REST_FRAMEWORK as BASE_REST_FRAMEWORK

DEBUG = False

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]

# Throttling is covered by configuration review, not by the test suite; leaving
# it on makes tests order-dependent (shared LocMem cache counters).
REST_FRAMEWORK = {
    **BASE_REST_FRAMEWORK,
    "DEFAULT_THROTTLE_CLASSES": (),
    "DEFAULT_THROTTLE_RATES": {
        "anon": "10000/min",
        "user": "10000/min",
        "auth": "10000/min",
        "tracking": "10000/min",
    },
}
