"""
JWT token helpers wrapping simplejwt.

Infrastructure layer only — business services must call these helpers
instead of importing DRF or simplejwt directly.
"""

from django.contrib.auth import get_user_model

from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from apps.shared.audit.services import log_action


def issue_tokens_for_user(user) -> dict:
    """
    Issue a new access/refresh token pair for the given user.

    Args:
        user: Authenticated User instance.

    Returns:
        Dict with ``access`` and ``refresh`` string tokens.
    """
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


def blacklist_refresh_token(refresh_token_str: str) -> None:
    """
    Blacklist a refresh token so it cannot be reused.

    Args:
        refresh_token_str: Raw refresh token string from the client.

    Returns:
        None. Invalid tokens are ignored silently.
    """
    if not refresh_token_str:
        return
    try:
        token = RefreshToken(refresh_token_str)
        token.blacklist()
        log_action(None, "TOKEN_BLACKLIST", "Token", None)
    except (TokenError, Exception):
        pass


def refresh_access_token(refresh_token_str: str) -> dict:
    """
    Rotate a refresh token and return a new token pair.

    Args:
        refresh_token_str: Valid refresh token string.

    Returns:
        Dict with new ``access`` and ``refresh`` string tokens.

    Raises:
        TokenError: When the refresh token is invalid or blacklisted.
    """
    old_refresh = RefreshToken(refresh_token_str)
    user_id = old_refresh["user_id"]
    user = get_user_model().objects.get(id=user_id)
    old_refresh.blacklist()
    new_refresh = RefreshToken.for_user(user)
    return {
        "access": str(new_refresh.access_token),
        "refresh": str(new_refresh),
    }
