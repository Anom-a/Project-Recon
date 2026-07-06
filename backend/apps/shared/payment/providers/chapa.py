"""Chapa payment provider — the only fully implemented provider.

Communicates with Chapa's API to initialise and verify payments.
Normalizes all responses into a provider-agnostic shape so business
modules never need to know Chapa's specific response format.

API keys are read from Django settings (``CHAPA_SECRET_KEY``), never
from ``os.environ`` directly.
"""

import requests
from django.conf import settings

from apps.shared.payment.providers.base import BasePaymentProvider
from apps.shared.payment.exceptions import (
    PaymentProviderError,
    PaymentVerificationError,
)


class ChapaPaymentProvider(BasePaymentProvider):
    """Concrete payment provider for the Chapa payment gateway.

    Attributes:
        BASE_URL: Chapa API base URL.
    """

    BASE_URL = "https://api.chapa.co/v1"

    def _get_headers(self) -> dict:
        """Build authorisation headers from Django settings.

        Returns:
            Dict with ``Authorization`` and ``Content-Type`` headers.

        Raises:
            PaymentProviderError: If ``CHAPA_SECRET_KEY`` is not
                configured.
        """
        secret_key = getattr(settings, "CHAPA_SECRET_KEY", None)
        if not secret_key:
            raise PaymentProviderError(
                "Chapa provider requires CHAPA_SECRET_KEY in Django settings."
            )
        return {
            "Authorization": f"Bearer {secret_key}",
            "Content-Type": "application/json",
        }

    def initialize(
        self,
        amount: float,
        currency: str,
        reference: str,
        callback_url: str,
        customer: dict,
    ) -> dict:
        """Initialize a Chapa payment transaction.

        Args:
            amount: Payment amount.
            currency: ISO 4217 currency code (e.g. ``"ETB"``).
            reference: Unique transaction reference.
            callback_url: URL for Chapa to notify on completion.
            customer: Dict with ``email`` and optionally
                ``first_name``, ``last_name``, ``phone_number``.

        Returns:
            Normalized dict::

                {
                    "status": str,
                    "reference": str,
                    "amount": float,
                    "currency": str,
                    "checkout_url": str,
                    "raw": dict,
                }

        Raises:
            PaymentProviderError: On HTTP or API failure.
        """
        payload = {
            "amount": str(amount),
            "currency": currency,
            "tx_ref": reference,
            "callback_url": callback_url,
            "email": customer.get("email", ""),
            "first_name": customer.get("first_name", ""),
            "last_name": customer.get("last_name", ""),
            "phone_number": customer.get("phone_number", ""),
        }

        try:
            response = requests.post(
                f"{self.BASE_URL}/transaction/initialize",
                json=payload,
                headers=self._get_headers(),
                timeout=30,
            )
        except requests.RequestException as exc:
            raise PaymentProviderError(
                f"Chapa initialisation request failed: {exc}"
            ) from exc

        if response.status_code != 200:
            raise PaymentProviderError(
                f"Chapa initialisation failed with status {response.status_code}: "
                f"{response.text}"
            )

        data = response.json()

        return {
            "status": data.get("status", ""),
            "reference": reference,
            "amount": amount,
            "currency": currency,
            "checkout_url": data.get("data", {}).get("checkout_url", ""),
            "raw": data,
        }

    def verify(self, reference: str) -> dict:
        """Verify a Chapa payment by transaction reference.

        Args:
            reference: The transaction reference to verify.

        Returns:
            Normalized dict::

                {
                    "status": str,
                    "reference": str,
                    "amount": float | None,
                    "currency": str,
                    "raw": dict,
                }

        Raises:
            PaymentVerificationError: On HTTP or API failure.
        """
        try:
            response = requests.get(
                f"{self.BASE_URL}/transaction/verify/{reference}",
                headers=self._get_headers(),
                timeout=30,
            )
        except requests.RequestException as exc:
            raise PaymentVerificationError(
                f"Chapa verification request failed: {exc}"
            ) from exc

        if response.status_code != 200:
            raise PaymentVerificationError(
                f"Chapa verification failed with status {response.status_code}: "
                f"{response.text}"
            )

        data = response.json()
        tx_data = data.get("data", {})

        return {
            "status": data.get("status", ""),
            "reference": reference,
            "amount": tx_data.get("amount"),
            "currency": tx_data.get("currency", ""),
            "raw": data,
        }
