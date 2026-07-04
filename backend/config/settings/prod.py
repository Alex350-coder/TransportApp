"""Production settings: security hardening on top of base."""
from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F401,F403
from .base import env

DEBUG = False

# Fail fast if the operator forgot to configure a real secret key: booting with
# the checked-in dev fallback would allow session/JWT forgery.
_MIN_SECRET_KEY_LENGTH = 50
SECRET_KEY = env("DJANGO_SECRET_KEY", default="")
if not SECRET_KEY or "dev-only-insecure" in SECRET_KEY or len(SECRET_KEY) < _MIN_SECRET_KEY_LENGTH:
    raise ImproperlyConfigured(
        "DJANGO_SECRET_KEY must be set to a strong unique value (>=50 chars) in production."
    )

SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"

# Needed by the Django admin (session+CSRF) when served behind another origin.
CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS", default=[])

# Uncomment once a reverse proxy terminates TLS AND sets this header itself
# (enabling it without a proxy that overwrites the header allows spoofing):
# SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
