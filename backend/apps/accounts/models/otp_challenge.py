"""OTP challenge model for reusable verification workflows."""

import uuid

from django.db import models

from apps.accounts.constants import OTPPurpose


class OTPChallenge(models.Model):
    """
    Stores hashed one-time passwords for email, device, and password-reset flows.

    Only OTPService may write to this model.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="otp_challenges"
    )
    purpose = models.CharField(max_length=50, choices=OTPPurpose.choices, db_index=True)
    otp_code = models.CharField(max_length=128)
    expires_at = models.DateTimeField(db_index=True)
    attempts = models.PositiveSmallIntegerField(default=0)
    resend_count = models.PositiveSmallIntegerField(default=0)
    is_used = models.BooleanField(default=False, db_index=True)
    metadata = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "accounts_otp_challenge"
        indexes = [
            models.Index(fields=["user", "purpose", "is_used"]),
        ]
