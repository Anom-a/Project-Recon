"""Permission classes for the audit API.

Restricts all audit endpoints to users with an active Super Admin role
assignment. Role checking is delegated to
``apps.accounts.permissions.roles.user_is_super_admin`` — a service-level
cross-module call allowed by ARCHITECTURE.md.
"""

from rest_framework.permissions import BasePermission

from apps.accounts.permissions.roles import user_is_super_admin


class IsSuperAdmin(BasePermission):
    """Allow access only to authenticated Super Admin users.

    Uses the accounts service-layer helper to evaluate role assignments
    without importing any accounts model directly.
    """

    def has_permission(self, request, view) -> bool:
        """Return True when the requesting user holds an active Super Admin assignment.

        Args:
            request: The incoming DRF request.
            view: The view being accessed.

        Returns:
            ``True`` if the user is authenticated and has the Super Admin
            role; ``False`` otherwise.
        """
        return request.user.is_authenticated and user_is_super_admin(request.user)
