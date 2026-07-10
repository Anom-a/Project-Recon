from rest_framework import serializers

from apps.events.models import EventPayment


class EventPaymentSerializer(serializers.ModelSerializer):
    registration_id = serializers.UUIDField(source="registration.id", read_only=True)
    event_title = serializers.CharField(source="registration.event.title", read_only=True)
    student_name = serializers.SerializerMethodField()
    student_email = serializers.EmailField(
        source="registration.student.user.email", read_only=True, default=None
    )

    class Meta:
        model = EventPayment
        fields = [
            "id",
            "registration",
            "registration_id",
            "event_title",
            "student_name",
            "student_email",
            "amount",
            "payment_method",
            "payment_provider",
            "transaction_reference",
            "status",
            "payment_date",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id", "payment_provider", "transaction_reference", "status",
            "payment_date", "created_at", "updated_at",
        ]

    def get_student_name(self, obj):
        if obj.registration.student:
            user = obj.registration.student.user
            name = f"{user.first_name} {user.last_name}".strip()
            return name or user.email
        return obj.registration.public_full_name


class CashPaymentSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    payment_date = serializers.DateTimeField(required=False, allow_null=True)


class OnlinePaymentInitializeSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    callback_url = serializers.URLField(max_length=500)
    return_url = serializers.URLField(max_length=500, required=False, allow_null=True, allow_blank=True)


class OnlinePaymentVerifySerializer(serializers.Serializer):
    reference = serializers.CharField(max_length=255)
