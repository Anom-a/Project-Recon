"""Organizational branch model."""

import uuid

from django.db import models

from apps.accounts.constants import BranchStatus


class Branch(models.Model):
    """
    Organizational branch with contact details and operational status.

    Staff and manager relationships are expressed via UserAssignment.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150, unique=True, db_index=True)
    code = models.CharField(max_length=20, unique=True, db_index=True)
    email = models.EmailField(null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True, db_index=True)
    state_region = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, default="Ethiopia")
    status = models.CharField(
        max_length=20,
        choices=BranchStatus.choices,
        default=BranchStatus.ACTIVE,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        """Persist branch with uppercase code."""
        if self.code:
            self.code = self.code.upper()
        super().save(*args, **kwargs)

    class Meta:
        db_table = "accounts_branch"
