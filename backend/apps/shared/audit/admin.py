"""Django admin registration for AuditLog.

Provides a read-only admin interface — no add/change/delete permissions
are granted since audit records are immutable.
"""

from django.contrib import admin

from apps.shared.audit.models.audit_log import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    """Read-only admin view for the platform audit trail."""

    list_display = (
        "action",
        "actor",
        "resource_type",
        "resource_id",
        "branch",
        "ip_address",
        "created_at",
    )
    list_filter = ("action", "resource_type", "created_at")
    search_fields = ("resource_type", "ip_address", "user_agent")
    readonly_fields = (
        "id",
        "actor",
        "action",
        "resource_type",
        "resource_id",
        "branch",
        "ip_address",
        "user_agent",
        "created_at",
    )
    ordering = ("-created_at",)

    def has_add_permission(self, request):
        """Deny add — records are created only via AuditService."""
        return False

    def has_change_permission(self, request, obj=None):
        """Deny change — audit records are immutable."""
        return False

    def has_delete_permission(self, request, obj=None):
        """Deny delete — audit records must never be removed."""
        return False
