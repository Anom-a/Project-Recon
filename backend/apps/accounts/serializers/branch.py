"""Branch serializers for accounts API."""

from rest_framework import serializers

from apps.accounts.models import Branch


class BranchSerializer(serializers.ModelSerializer):
    """Branch read/write serializer mirroring the locked field spec."""

    class Meta:
        model = Branch
        fields = (
            "id",
            "name",
            "code",
            "email",
            "phone_number",
            "address",
            "city",
            "state_region",
            "country",
            "status",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "status", "created_at", "updated_at")


class BranchCreateSerializer(serializers.ModelSerializer):
    """Validate branch creation input."""

    class Meta:
        model = Branch
        fields = (
            "name",
            "code",
            "email",
            "phone_number",
            "address",
            "city",
            "state_region",
            "country",
        )


class BranchUpdateSerializer(serializers.Serializer):
    """Validate partial branch updates."""

    name = serializers.CharField(max_length=150, required=False)
    code = serializers.CharField(max_length=20, required=False)
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    phone_number = serializers.CharField(max_length=20, required=False, allow_blank=True, allow_null=True)
    address = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    city = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    state_region = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    country = serializers.CharField(max_length=100, required=False)


class BranchWithManagerSerializer(serializers.Serializer):
    """Create a branch and assign an existing user as manager."""

    name = serializers.CharField(max_length=150)
    code = serializers.CharField(max_length=20)
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    phone_number = serializers.CharField(max_length=20, required=False, allow_blank=True, allow_null=True)
    address = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    city = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    state_region = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    country = serializers.CharField(max_length=100, required=False, default="Ethiopia")
    manager_user_id = serializers.UUIDField()

    def get_branch_fields(self) -> dict:
        """Return branch field dict for BranchService."""
        branch_keys = (
            "name", "code", "email", "phone_number", "address",
            "city", "state_region", "country",
        )
        return {k: self.validated_data[k] for k in branch_keys if k in self.validated_data}


class ManagerActionSerializer(serializers.Serializer):
    """Assign or change branch manager using an existing user."""

    manager_user_id = serializers.UUIDField()
