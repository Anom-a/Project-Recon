"""Payment domain exceptions.

Provides a shallow exception hierarchy for payment provider errors.
Business modules catch ``PaymentProviderError`` and decide how to handle
failures.
"""


class PaymentProviderError(Exception):
    """Raised when a payment provider encounters an error.

    This is the base exception for all payment-related failures within
    the shared payment infrastructure.
    """


class PaymentVerificationError(PaymentProviderError):
    """Raised when payment verification fails.

    Indicates that the provider could not confirm the payment status,
    either due to a network error, an invalid reference, or a provider
    rejection.
    """
