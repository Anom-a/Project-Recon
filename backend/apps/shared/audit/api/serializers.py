"""Read-only serializers for the audit trail API.

Exposes all AuditLog fields with nested representations for the ``actor``
and ``branch`` foreign keys.
"""

from rest_framework import serializers

from apps.shared.audit.models.audit_log import AuditLog


class _ActorSerializer(serializers.Serializer):
    """Minimal nested representation of the audit actor.

    Fields:
        id: User UUID.
        email: User email address.
        full_name: Combined first + last name.
    """

    id = serializers.UUIDField(read_only=True)
    email = serializers.EmailField(read_only=True)
    full_name = serializers.CharField(read_only=True)


class _BranchSerializer(serializers.Serializer):
    """Minimal nested representation of the branch context.

    Fields:
        id: Branch UUID.
        name: Branch display name.
        code: Branch short code.
    """

    id = serializers.UUIDField(read_only=True)
    name = serializers.CharField(read_only=True)
    code = serializers.CharField(read_only=True)


class AuditLogSerializer(serializers.ModelSerializer):
    """Read-only serializer exposing the full AuditLog record.

    Nests ``actor`` as ``{id, email, full_name}`` and ``branch`` as
    ``{id, name, code}`` when the related objects are present.
    """

    actor = _ActorSerializer(read_only=True)
    branch = _BranchSerializer(read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "actor",
            "action",
            "resource_type",
            "resource_id",
            "branch",
            "ip_address",
            "user_agent",
            "created_at",
        ]
        read_only_fields = fields
