"""UserAssignment read serializer with nested user and branch summaries."""

from rest_framework import serializers

from apps.accounts.constants import Roles
from apps.accounts.models import UserAssignment


def _minimal_user(user) -> dict | None:
    """Serialize a user as id, email, full_name."""
    if user is None:
        return None
    return {"id": user.id, "email": user.email, "full_name": user.full_name}


def _minimal_branch(branch) -> dict | None:
    """Serialize a branch as id, name, code."""
    if branch is None:
        return None
    return {"id": branch.id, "name": branch.name, "code": branch.code}


class UserAssignmentSerializer(serializers.ModelSerializer):
    """Assignment output with nested user and branch references."""

    user = serializers.SerializerMethodField()
    branch = serializers.SerializerMethodField()
    assigned_by = serializers.SerializerMethodField()

    class Meta:
        model = UserAssignment
        fields = (
            "id",
            "user",
            "branch",
            "role",
            "is_primary",
            "is_active",
            "assigned_by",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields

    def get_user(self, obj) -> dict | None:
        return _minimal_user(obj.user)

    def get_branch(self, obj) -> dict | None:
        return _minimal_branch(obj.branch)

    def get_assigned_by(self, obj) -> dict | None:
        return _minimal_user(obj.assigned_by)


class AssignRoleSerializer(serializers.Serializer):
    """Validate new assignment creation."""

    user_id = serializers.UUIDField()
    branch_id = serializers.UUIDField(required=False, allow_null=True)
    role = serializers.ChoiceField(choices=Roles.choices)
    is_primary = serializers.BooleanField(default=False)


class UpdateAssignmentSerializer(serializers.Serializer):
    """Validate assignment field updates."""

    is_primary = serializers.BooleanField(required=False)
    is_active = serializers.BooleanField(required=False)


class TransferUserSerializer(serializers.Serializer):
    """Validate user transfer between branches."""

    user_id = serializers.UUIDField()
    from_branch_id = serializers.UUIDField()
    to_branch_id = serializers.UUIDField()
    role = serializers.ChoiceField(choices=Roles.choices)
