"""User-to-branch role assignment model."""

import uuid

from django.db import models
from django.db.models import Q

from apps.accounts.constants import Roles


class UserAssignment(models.Model):
    """
    Maps a user to a role within a branch (or Super Admin with null branch).

    Replaces separate UserRole and UserBranch tables from legacy designs.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="assignments"
    )
    branch = models.ForeignKey(
        "accounts.Branch",
        on_delete=models.PROTECT,
        related_name="assignments",
        null=True,
        blank=True,
    )
    role = models.CharField(max_length=50, choices=Roles.choices, db_index=True)
    is_primary = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    assigned_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        related_name="created_assignments",
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "accounts_user_assignment"
        indexes = [
            models.Index(fields=["branch", "role"]),
            models.Index(fields=["is_active"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "branch", "role"], name="unique_user_branch_role"
            ),
            models.UniqueConstraint(
                fields=["user"],
                condition=Q(is_primary=True),
                name="unique_primary_assignment_per_user",
            ),
            models.CheckConstraint(
                check=(
                    (Q(role=Roles.SUPER_ADMIN) & Q(branch__isnull=True))
                    | (~Q(role=Roles.SUPER_ADMIN) & Q(branch__isnull=False))
                ),
                name="super_admin_no_branch_others_must_have_branch",
            ),
        ]
