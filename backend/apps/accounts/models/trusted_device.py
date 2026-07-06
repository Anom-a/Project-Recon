"""Trusted device model for device-verification bypass."""

import uuid

from django.db import models

from apps.accounts.constants import DeviceType


class TrustedDevice(models.Model):
    """
    Device that completed verification and may skip future device OTP challenges.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="trusted_devices"
    )
    device_id = models.CharField(max_length=255, db_index=True)
    device_name = models.CharField(max_length=255, null=True, blank=True)
    device_type = models.CharField(
        max_length=50, choices=DeviceType.choices, null=True, blank=True
    )
    fingerprint = models.CharField(max_length=255, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    last_used_at = models.DateTimeField(db_index=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "accounts_trusted_device"
        indexes = [
            models.Index(fields=["user", "is_active"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "fingerprint"], name="unique_user_fingerprint"
            )
        ]
