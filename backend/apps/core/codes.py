"""Human-readable reference codes shared by bookings and parcels."""
import secrets

# Unambiguous alphabet (no O/0, I/1/L) for codes read over the phone.
CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
DEFAULT_CODE_LENGTH = 6


def generate_code(prefix: str, length: int = DEFAULT_CODE_LENGTH) -> str:
    suffix = "".join(secrets.choice(CODE_ALPHABET) for _ in range(length))
    return f"{prefix}{suffix}"
