"""
Scheduled maintenance tasks for the accounts module.

Business logic remains in services; tasks only orchestrate service calls.
Celery decorators can be added when a worker is introduced.
"""

from apps.accounts.services import otp_service, device_service


def cleanup_otp_challenges() -> int:
    """
    Invalidate expired OTP challenges.

    Returns:
        Number of OTP rows updated.
    """
    return otp_service.cleanup_expired()


def cleanup_trusted_devices() -> int:
    """
    Deactivate expired trusted devices.

    Returns:
        Number of device rows updated.
    """
    return device_service.cleanup_expired()
