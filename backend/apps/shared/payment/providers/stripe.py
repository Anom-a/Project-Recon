"""Stripe payment provider stub.

This provider exists so that setting ``PAYMENT_PROVIDER=stripe`` does
not break the application, but the actual Stripe integration is not yet
implemented.
"""

from apps.shared.payment.providers.base import BasePaymentProvider


class StripePaymentProvider(BasePaymentProvider):
    """Stub Stripe provider — not yet implemented.

    Raises ``NotImplementedError`` on every method call.
    """

    def initialize(
        self,
        amount: float,
        currency: str,
        reference: str,
        callback_url: str,
        customer: dict,
    ) -> dict:
        """Raise NotImplementedError — Stripe is not yet integrated.

        Raises:
            NotImplementedError: Always.
        """
        raise NotImplementedError("Stripe support not yet implemented")

    def verify(self, reference: str) -> dict:
        """Raise NotImplementedError — Stripe is not yet integrated.

        Raises:
            NotImplementedError: Always.
        """
        raise NotImplementedError("Stripe support not yet implemented")
