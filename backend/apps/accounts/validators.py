"""
Reusable validators for the accounts module.
"""

import re


def normalize_phone_number(phone: str | None) -> str | None:
    """
    Normalize a phone number by stripping whitespace and non-digit separators.

    Args:
        phone: Raw phone number string, or None.

    Returns:
        Normalized phone string, or None when input is empty.
    """
    if not phone:
        return None
    normalized = re.sub(r"[\s\-()]+", "", phone.strip())
    return normalized or None
