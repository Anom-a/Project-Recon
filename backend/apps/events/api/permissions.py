from rest_framework.permissions import BasePermission, SAFE_METHODS

from apps.accounts.permissions.roles import (
    user_is_branch_manager,
    user_is_instructor,
    user_is_super_admin,
)


class IsEventStaff(BasePermission):
    """
    Allow access only to Super Admin or Branch Manager.
    """

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and (user_is_super_admin(request.user) or user_is_branch_manager(request.user))
        )


class IsEventStaffOrInstructor(BasePermission):
    """
    Allow access to Super Admin, Branch Manager, or an assigned Instructor.

    Object-level: instructors may only access their own workshops.
    """

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                user_is_super_admin(request.user)
                or user_is_branch_manager(request.user)
                or user_is_instructor(request.user)
            )
        )

    def has_object_permission(self, request, view, obj):
        if user_is_super_admin(request.user) or user_is_branch_manager(request.user):
            return True
        if user_is_instructor(request.user):
            if hasattr(obj, "instructor"):
                return obj.instructor == request.user
            return True
        return False
