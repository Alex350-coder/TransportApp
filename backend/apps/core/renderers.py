"""Consistent API response envelope: {"success", "data", "error"}."""
from rest_framework.renderers import JSONRenderer


class EnvelopeJSONRenderer(JSONRenderer):
    """Wraps every JSON response in the project-wide envelope.

    Success:  {"success": true,  "data": <payload>, "error": null}
    Failure:  {"success": false, "data": null,      "error": <details>}
    """

    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = (renderer_context or {}).get("response")
        is_error = response is not None and response.status_code >= 400

        if is_error:
            envelope = {"success": False, "data": None, "error": data}
        else:
            envelope = {"success": True, "data": data, "error": None}

        return super().render(envelope, accepted_media_type, renderer_context)
