"""Trusted device serializers for accounts API."""

from rest_framework import serializers

from apps.accounts.models import TrustedDevice
from apps.accounts.constants import DeviceType

class TrustedDeviceSerializer(serializers.ModelSerializer):
    """Trusted device output — never exposes sensitive tokens."""

    class Meta:
        model = TrustedDevice
        fields = (
            "id",
            "device_id",
            "device_name",
            "device_type",
            "fingerprint",
            "ip_address",
            "last_used_at",
            "expires_at",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class RevokeAllDevicesSerializer(serializers.Serializer):
    """Validate revoke-all request keeping the current device."""

    current_fingerprint = serializers.CharField()


class DeviceInfoSerializer(serializers.Serializer):
    """
    Optional device metadata passed to authentication flows.

    Never echoed in responses.
    """

    device_id = serializers.CharField(required=False, allow_blank=True)
    device_name = serializers.CharField(required=False, allow_blank=True)
    device_type = serializers.ChoiceField(choices=DeviceType.choices, required=False)
    fingerprint = serializers.CharField(required=False, allow_blank=True)
    user_agent = serializers.CharField(required=False, allow_blank=True)

