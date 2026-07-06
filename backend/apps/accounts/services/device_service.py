"""
Trusted device registration and verification service.
"""

from django.db.models import Q
from django.utils import timezone

from apps.accounts.models import TrustedDevice
from apps.accounts.services import otp_service
from apps.accounts.constants import OTPPurpose
from apps.shared.audit.services import log_action

def register_device(user, device_info: dict) -> TrustedDevice:
    """
    Register or refresh a trusted device for a user.

    Args:
        user: Device owner.
        device_info: Dict with fingerprint, device_id, device_name, device_type, ip_address.

    Returns:
        TrustedDevice instance.
    """
    fingerprint = device_info.get("fingerprint")
    device, _created = TrustedDevice.objects.update_or_create(
        user=user,
        fingerprint=fingerprint,
        defaults={
            "device_id": device_info.get("device_id"),
            "device_name": device_info.get("device_name"),
            "device_type": device_info.get("device_type"),
            "ip_address": device_info.get("ip_address"),
            "last_used_at": timezone.now(),
            "is_active": True,
        },
    )

    log_action(user, "DEVICE_REGISTERED", "Device", device.id, details={"fingerprint": fingerprint})
    
    return device


def verify_device(user, otp: str, device_info: dict) -> TrustedDevice:
    """
    Verify a device OTP and register the device.

    Args:
        user: Device owner.
        otp: One-time password code.
        device_info: Device metadata for registration.

    Returns:
        TrustedDevice instance.
    """
    otp_service.verify(user, OTPPurpose.DEVICE_VERIFICATION, otp)
    log_action(user, "DEVICE_VERIFICATION_SUCCESS", "User", user.id)
    return register_device(user, device_info)


def is_device_trusted(user, fingerprint: str) -> bool:
    """
    Return True when the fingerprint matches an active, non-expired trusted device.

    Args:
        user: Device owner.
        fingerprint: Client device fingerprint.

    Returns:
        True if the device is trusted.
    """
    if not fingerprint:
        return False

    now = timezone.now()
    return TrustedDevice.objects.filter(
        user=user,
        fingerprint=fingerprint,
        is_active=True,
    ).filter(
        Q(expires_at__isnull=True) | Q(expires_at__gte=now)
    ).exists()


def list_devices(user, active_only: bool = True):
    """
    List trusted devices for a user.

    Args:
        user: Device owner.
        active_only: When True, return only active devices.

    Returns:
        QuerySet of TrustedDevice rows.
    """
    qs = TrustedDevice.objects.filter(user=user)
    if active_only:
        qs = qs.filter(is_active=True)
    return qs.order_by("-last_used_at")

def remove_device(user, fingerprint: str) -> None:
    """
    Deactivate a trusted device.

    Args:
        user: Device owner.
        fingerprint: Device fingerprint to revoke.
    """
    device = TrustedDevice.objects.filter(user=user, fingerprint=fingerprint).first()
    if device:
        device.is_active = False
        device.save()
        log_action(user, "DEVICE_REVOKED", "Device", device.id)

def remove_all_devices_except_current(user, current_fingerprint: str) -> None:
    """
    Deactivate all trusted devices except the current one.

    Args:
        user: Device owner.
        current_fingerprint: Fingerprint of the device to keep active.
    """
    TrustedDevice.objects.filter(user=user).exclude(
        fingerprint=current_fingerprint
    ).update(is_active=False)
    log_action(user, "ALL_DEVICES_REVOKED", "Device", None)


def build_device_info(validated: dict, request=None) -> dict:
    """
    Merge serializer device fields with request-derived IP when available.

    Args:
        validated: Validated device-info dict.
        request: Optional DRF request for IP extraction.

    Returns:
        Dict suitable for service ``device_info`` arguments.
    """
    info = {k: v for k, v in validated.items() if v}
    if request is not None:
        ip = request.META.get("HTTP_X_FORWARDED_FOR", "").split(",")[0].strip()
        if not ip:
            ip = request.META.get("REMOTE_ADDR")
        if ip:
            info["ip_address"] = ip
    return info


def cleanup_expired() -> int:
    """
    Deactivate trusted devices past their expiry time.

    Returns:
        Number of devices deactivated.
    """
    now = timezone.now()
    return TrustedDevice.objects.filter(
        is_active=True,
        expires_at__isnull=False,
        expires_at__lt=now,
    ).update(is_active=False)
