"""PaymentService — unified payment interface.

Selects the configured provider from ``settings.PAYMENT_PROVIDER`` using
a simple if/elif lookup (no registry pattern, no factory abstraction)
and delegates initialisation and verification.

The service never creates or updates business records — it only reports
what the provider said. Business services interpret the result and
decide what to do.
"""

from django.conf import settings

from apps.shared.payment.exceptions import PaymentProviderError


def initialize_payment(
    amount: float,
    currency: str,
    reference: str,
    callback_url: str,
    customer: dict,
) -> dict:
    """Initialize a payment through the active provider.

    The provider is determined by ``settings.PAYMENT_PROVIDER``.

    Args:
        amount: Payment amount.
        currency: ISO 4217 currency code (e.g. ``"ETB"``).
        reference: Unique transaction reference.
        callback_url: URL for the provider to notify on completion.
        customer: Dict with at least ``email`` and optionally
            ``first_name``, ``last_name``, ``phone_number``.

    Returns:
        Normalized provider response dict::

            {
                "status": str,
                "reference": str,
                "amount": float,
                "currency": str,
                "checkout_url": str,
                "raw": dict,
            }

    Raises:
        PaymentProviderError: If the provider is unknown or
            initialisation fails.
    """
    provider = _get_provider()
    return provider.initialize(amount, currency, reference, callback_url, customer)


def verify_payment(reference: str) -> dict:
    """Verify a payment through the active provider.

    Args:
        reference: The transaction reference to verify.

    Returns:
        Normalized verification result dict::

            {
                "status": str,
                "reference": str,
                "amount": float | None,
                "currency": str,
                "raw": dict,
            }

    Raises:
        PaymentProviderError: If the provider is unknown or
            verification fails.
    """
    provider = _get_provider()
    return provider.verify(reference)


def _get_provider():
    """Return the concrete provider instance based on settings.

    Returns:
        An instance of the configured payment provider.

    Raises:
        PaymentProviderError: If the provider key is unknown.
    """
    provider_key = getattr(settings, "PAYMENT_PROVIDER", "chapa")

    if provider_key == "chapa":
        from apps.shared.payment.providers.chapa import ChapaPaymentProvider
        return ChapaPaymentProvider()
    elif provider_key == "stripe":
        from apps.shared.payment.providers.stripe import StripePaymentProvider
        return StripePaymentProvider()
    else:
        raise PaymentProviderError(
            f"Unknown payment provider: '{provider_key}'. "
            f"Set PAYMENT_PROVIDER to one of: chapa, stripe."
        )
