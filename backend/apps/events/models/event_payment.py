import uuid

from django.core.exceptions import ValidationError
from django.db import models

from apps.events.constants import PaymentMethod, PaymentProvider, PaymentStatus


class EventPayment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    registration = models.OneToOneField(
        "events.EventRegistration",
        on_delete=models.PROTECT,
        related_name="payment",
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(
        max_length=10,
        choices=PaymentMethod.choices,
        db_index=True,
    )
    payment_provider = models.CharField(
        max_length=10,
        choices=PaymentProvider.choices,
        null=True,
        blank=True,
    )
    transaction_reference = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        db_index=True,
    )
    payment_date = models.DateTimeField(null=True, blank=True, db_index=True)
    status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "events_event_payment"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Payment for {self.registration} — {self.get_status_display()}"

    def clean(self):
        if self.amount is not None and self.amount <= 0:
            raise ValidationError({"amount": "Payment amount must be greater than zero."})
        if self.payment_method == PaymentMethod.ONLINE and not self.payment_provider:
            raise ValidationError(
                {"payment_provider": "Payment provider is required for online payments."}
            )
