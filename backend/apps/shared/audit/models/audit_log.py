"""Append-only platform audit log model.

Stores an immutable trail of important system actions. Rows are written
exclusively through ``AuditService`` and are never updated or deleted.
"""

import uuid

from django.conf import settings
from django.db import models


class AuditLog(models.Model):
    """Cross-module audit trail written exclusively through AuditService.

    Fields mirror the spec from *Shared_Database_Design_v1.0* §4.
    The model enforces append-only semantics: ``save()`` rejects updates
    and ``delete()`` always raises.
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="audit_logs",
        db_index=True,
    )
    action = models.CharField(
        max_length=100,
        db_index=True,
    )
    resource_type = models.CharField(
        max_length=100,
        blank=True,
        default="",
        db_index=True,
    )
    resource_id = models.UUIDField(
        null=True,
        blank=True,
        db_index=True,
    )
    branch = models.ForeignKey(
        "accounts.Branch",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="audit_logs",
        db_index=True,
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    details = models.JSONField(null=True, blank=True)
    
    def save(self, *args, **kwargs):
        """Allow only the initial insert — raise on update attempts."""
        if self._state.adding:
            super().save(*args, **kwargs)
        else:
            raise ValueError("AuditLog records are immutable and cannot be updated.")

    def delete(self, *args, **kwargs):
        """Prevent deletion of audit records."""
        raise ValueError("AuditLog records are immutable and cannot be deleted.")

    class Meta:
        db_table = "shared_audit_log"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["created_at"], name="audit_created_idx"),
            models.Index(fields=["action"], name="audit_action_idx"),
            models.Index(fields=["resource_type"], name="audit_res_type_idx"),
            models.Index(fields=["resource_id"], name="audit_res_id_idx"),
        ]

    def __str__(self) -> str:
        return f"[{self.action}] {self.resource_type}:{self.resource_id} by {self.actor_id}"
