"""Exception handling that normalizes error payloads for the envelope."""
from rest_framework.views import exception_handler as drf_exception_handler


def envelope_exception_handler(exc, context):
    """Normalize DRF errors to {"detail": str, "code": str, "fields": dict|None}.

    The EnvelopeJSONRenderer wraps this into the standard envelope.
    """
    response = drf_exception_handler(exc, context)
    if response is None:
        return None

    data = response.data
    if isinstance(data, dict) and "detail" in data and len(data) <= 2:
        detail = data["detail"]
        normalized = {
            "detail": str(detail),
            "code": getattr(detail, "code", "error"),
            "fields": None,
        }
    else:
        # Validation errors: keep per-field messages for the frontend forms.
        normalized = {
            "detail": "Los datos enviados no son válidos.",
            "code": "validation_error",
            "fields": data,
        }

    response.data = normalized
    return response
