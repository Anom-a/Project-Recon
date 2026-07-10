import logging
import re
from uuid import uuid4

from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import NotFound, ValidationError

from apps.events.constants import PaymentMethod, PaymentStatus
from apps.events.models import EventPayment, EventRegistration
from apps.shared.audit.services import log_action
from apps.shared.payment.exceptions import PaymentError
from apps.shared.payment.payment_service import (
    initialize_payment as shared_initialize_payment,
    verify_payment as shared_verify_payment,
)

logger = logging.getLogger(__name__)

REFERENCE_PATTERN = re.compile(r"^EVENT-[a-f0-9]{8}-[a-f0-9]{12}$")


def _generate_reference(registration_id):
    """Generate a unique payment reference for event registrations."""
    reg_hex = registration_id.hex[:8]
    rand_hex = uuid4().hex[:12]
    return f"EVENT-{reg_hex}-{rand_hex}"


def get_payment_or_404(pk):
    """
    Retrieve an EventPayment by primary key or raise NotFound.

    Args:
        pk: Payment UUID as string or UUID instance.

    Returns:
        EventPayment instance with related registration, event, and student.
    """
    try:
        return EventPayment.objects.select_related(
            "registration__event",
            "registration__student__user",
        ).get(id=pk)
    except EventPayment.DoesNotExist:
        raise NotFound("Payment not found.")


def get_payment_by_reference(reference):
    """
    Retrieve an EventPayment by transaction reference or raise NotFound.

    Args:
        reference: Transaction reference string.

    Returns:
        EventPayment instance with related registration, event, and student.
    """
    try:
        return EventPayment.objects.select_related(
            "registration__event",
            "registration__student__user",
        ).get(transaction_reference=reference)
    except EventPayment.DoesNotExist:
        raise NotFound("Payment not found.")


def list_payments(registration_id=None, status=None):
    """
    Return payments, optionally filtered.

    Args:
        registration_id: Optional registration UUID to filter by.
        status: Optional payment status to filter by.

    Returns:
        QuerySet of EventPayment objects.
    """
    qs = EventPayment.objects.select_related(
        "registration__event", "registration__student__user"
    ).all()
    if registration_id:
        qs = qs.filter(registration_id=registration_id)
    if status:
        qs = qs.filter(status=status)
    return qs


def record_cash_payment(registration_id, amount, actor=None, payment_date=None):
    """
    Record a cash payment for a registration.

    Args:
        registration_id: EventRegistration UUID (or instance).
        amount: Decimal payment amount.
        actor: Optional User performing the action.
        payment_date: Optional datetime of payment.

    Returns:
        Created EventPayment instance.

    Raises:
        ValidationError: If registration already has a payment or rules violated.
        NotFound: If registration not found.
    """
    if not isinstance(registration_id, EventRegistration):
        try:
            registration = EventRegistration.objects.select_related("event").get(
                id=registration_id
            )
        except EventRegistration.DoesNotExist:
            raise NotFound("Registration not found.")
    else:
        registration = registration_id

    if hasattr(registration, "payment"):
        raise ValidationError("This registration already has a payment record.")

    if amount <= 0:
        raise ValidationError("Payment amount must be greater than zero.")

    with transaction.atomic():
        payment = EventPayment(
            registration=registration,
            amount=amount,
            payment_method=PaymentMethod.CASH,
            payment_provider=None,
            status=PaymentStatus.PAID,
            payment_date=payment_date or timezone.now(),
        )
        payment.full_clean()
        payment.save()

        registration.payment_status = PaymentStatus.PAID
        registration.save(update_fields=["payment_status", "updated_at"])

        log_action(
            actor=actor,
            action="payment.cash_created",
            resource_type="EventPayment",
            resource_id=payment.id,
        )

    return payment


def initialize_online_payment(
    registration_id,
    amount,
    callback_url,
    customer,
    actor=None,
    return_url=None,
):
    """
    Initialize an online payment for a registration.

    Args:
        registration_id: EventRegistration UUID (or instance).
        amount: Decimal payment amount.
        callback_url: URL for the payment provider to send webhook notifications.
        customer: Dict with customer info (email, first_name, last_name, etc.).
        actor: Optional User performing the action.
        return_url: Optional URL to redirect user after payment.

    Returns:
        Tuple of (EventPayment instance, checkout_url string).

    Raises:
        ValidationError: If registration already has a payment or initialization fails.
        NotFound: If registration not found.
    """
    if not isinstance(registration_id, EventRegistration):
        try:
            registration = EventRegistration.objects.select_related(
                "event", "student__user"
            ).get(id=registration_id)
        except EventRegistration.DoesNotExist:
            raise NotFound("Registration not found.")
    else:
        registration = registration_id

    if hasattr(registration, "payment"):
        raise ValidationError("This registration already has a payment record.")

    if amount <= 0:
        raise ValidationError("Payment amount must be greater than zero.")

    reference = _generate_reference(registration.id)

    with transaction.atomic():
        payment = EventPayment(
            registration=registration,
            amount=amount,
            payment_method=PaymentMethod.ONLINE,
            transaction_reference=reference,
            status=PaymentStatus.PENDING,
        )
        payment.save()

        try:
            result = shared_initialize_payment(
                amount=amount,
                currency="ETB",
                reference=reference,
                callback_url=callback_url,
                customer=customer,
                return_url=return_url,
            )
        except PaymentError as e:
            payment.status = PaymentStatus.FAILED
            payment.save(update_fields=["status"])
            raise ValidationError(f"Payment initialization failed: {e}")

        payment.payment_provider = result["provider"]
        payment.transaction_reference = result["reference"]
        payment.save(update_fields=["payment_provider", "transaction_reference"])

        log_action(
            actor=actor,
            action="payment.online_initialized",
            resource_type="EventPayment",
            resource_id=payment.id,
        )

    return payment, result["checkout_url"]


def verify_online_payment(*, reference):
    """
    Verify an online payment after provider callback.

    Args:
        reference: Transaction reference string.

    Returns:
        Updated EventPayment instance.

    Raises:
        ValidationError: If reference invalid, payment not in PENDING state,
                         or verification fails.
    """
    if not REFERENCE_PATTERN.match(reference):
        raise ValidationError("Invalid payment reference format.")

    payment = get_payment_by_reference(reference)
    registration = payment.registration

    if payment.status == PaymentStatus.PAID:
        return payment

    if payment.status != PaymentStatus.PENDING:
        raise ValidationError(f"Cannot verify payment in status '{payment.status}'.")

    try:
        result = shared_verify_payment(reference)
    except PaymentError as e:
        logger.error("Payment verification infrastructure error: %s", e)
        raise ValidationError("Payment verification temporarily unavailable.")

    if result["amount"] is not None and result["amount"] != payment.amount:
        payment.status = PaymentStatus.FAILED
        payment.save(update_fields=["status"])
        raise ValidationError("Payment amount mismatch detected.")

    with transaction.atomic():
        if result["status"] == "success":
            payment.status = PaymentStatus.PAID
            payment.payment_date = timezone.now()
            payment.payment_provider = result.get("provider", payment.payment_provider)
            payment.save()

            registration.payment_status = PaymentStatus.PAID
            registration.save(update_fields=["payment_status", "updated_at"])

            log_action(
                actor=None,
                action="payment.verified_success",
                resource_type="EventPayment",
                resource_id=payment.id,
                details={"reference": reference},
            )

        elif result["status"] in ("failed", "cancelled"):
            payment.status = PaymentStatus.FAILED
            payment.save(update_fields=["status"])

            log_action(
                actor=None,
                action="payment.verified_failed",
                resource_type="EventPayment",
                resource_id=payment.id,
                details={
                    "reference": reference,
                    "provider_status": result.get("provider_status"),
                },
            )

        else:
            logger.info(
                "Payment %s still pending after verification. reference=%s status=%s",
                payment.id,
                reference,
                result["status"],
            )

    return payment
