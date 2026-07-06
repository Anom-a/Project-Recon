"""Unit tests for PaymentService.

Tests that:
- initialize_payment() and verify_payment() return the normalized shape.
- PaymentProviderError is raised on HTTP failure / bad response.
- Provider selection respects settings.PAYMENT_PROVIDER override.
- Stripe stub raises NotImplementedError.
"""

from unittest.mock import patch, MagicMock

from django.test import TestCase, override_settings

from apps.shared.payment.services import initialize_payment, verify_payment
from apps.shared.payment.exceptions import (
    PaymentProviderError,
    PaymentVerificationError,
)


class PaymentServiceProviderSelectionTests(TestCase):
    """Verify that PaymentService selects the correct provider."""

    @override_settings(PAYMENT_PROVIDER="unknown_provider")
    def test_unknown_provider_raises_error(self):
        """initialize_payment() raises PaymentProviderError for unknown providers."""
        with self.assertRaises(PaymentProviderError):
            initialize_payment(
                amount=100.0,
                currency="ETB",
                reference="TX-001",
                callback_url="http://example.com/callback",
                customer={"email": "test@example.com"},
            )

    @override_settings(PAYMENT_PROVIDER="stripe")
    def test_stripe_raises_not_implemented(self):
        """Stripe stub raises NotImplementedError."""
        with self.assertRaises(NotImplementedError):
            initialize_payment(
                amount=100.0,
                currency="ETB",
                reference="TX-001",
                callback_url="http://example.com/callback",
                customer={"email": "test@example.com"},
            )

    @override_settings(PAYMENT_PROVIDER="stripe")
    def test_stripe_verify_raises_not_implemented(self):
        """Stripe stub verify raises NotImplementedError."""
        with self.assertRaises(NotImplementedError):
            verify_payment("TX-001")


class PaymentServiceChapaInitializeTests(TestCase):
    """Test Chapa payment initialisation via mocked HTTP calls."""

    @override_settings(PAYMENT_PROVIDER="chapa", CHAPA_SECRET_KEY="test-secret-key")
    @patch("apps.shared.payment.providers.chapa.requests.post")
    def test_initialize_returns_normalized_shape(self, mock_post):
        """initialize_payment() normalizes the Chapa response."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "status": "success",
            "data": {
                "checkout_url": "https://checkout.chapa.co/pay/test123",
            },
        }
        mock_post.return_value = mock_response

        result = initialize_payment(
            amount=500.0,
            currency="ETB",
            reference="TX-INIT-001",
            callback_url="http://example.com/callback",
            customer={
                "email": "buyer@example.com",
                "first_name": "Test",
                "last_name": "User",
            },
        )

        # Verify normalized shape
        self.assertIn("status", result)
        self.assertIn("reference", result)
        self.assertIn("amount", result)
        self.assertIn("currency", result)
        self.assertIn("checkout_url", result)
        self.assertIn("raw", result)

        self.assertEqual(result["status"], "success")
        self.assertEqual(result["reference"], "TX-INIT-001")
        self.assertEqual(result["amount"], 500.0)
        self.assertEqual(result["currency"], "ETB")
        self.assertEqual(result["checkout_url"], "https://checkout.chapa.co/pay/test123")

    @override_settings(PAYMENT_PROVIDER="chapa", CHAPA_SECRET_KEY="test-secret-key")
    @patch("apps.shared.payment.providers.chapa.requests.post")
    def test_initialize_raises_on_http_failure(self, mock_post):
        """initialize_payment() raises PaymentProviderError on non-200 status."""
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.text = "Bad Request"
        mock_post.return_value = mock_response

        with self.assertRaises(PaymentProviderError):
            initialize_payment(
                amount=100.0,
                currency="ETB",
                reference="TX-FAIL-001",
                callback_url="http://example.com/callback",
                customer={"email": "buyer@example.com"},
            )

    @override_settings(PAYMENT_PROVIDER="chapa", CHAPA_SECRET_KEY="test-secret-key")
    @patch("apps.shared.payment.providers.chapa.requests.post")
    def test_initialize_raises_on_network_error(self, mock_post):
        """initialize_payment() raises PaymentProviderError on network failure."""
        import requests as requests_lib

        mock_post.side_effect = requests_lib.ConnectionError("Network error")

        with self.assertRaises(PaymentProviderError):
            initialize_payment(
                amount=100.0,
                currency="ETB",
                reference="TX-NET-001",
                callback_url="http://example.com/callback",
                customer={"email": "buyer@example.com"},
            )

    @override_settings(PAYMENT_PROVIDER="chapa")
    def test_initialize_raises_without_secret_key(self):
        """initialize_payment() raises when CHAPA_SECRET_KEY is missing."""
        # Ensure CHAPA_SECRET_KEY is not set
        with self.settings(CHAPA_SECRET_KEY=None):
            with self.assertRaises(PaymentProviderError):
                initialize_payment(
                    amount=100.0,
                    currency="ETB",
                    reference="TX-NOKEY-001",
                    callback_url="http://example.com/callback",
                    customer={"email": "buyer@example.com"},
                )


class PaymentServiceChapaVerifyTests(TestCase):
    """Test Chapa payment verification via mocked HTTP calls."""

    @override_settings(PAYMENT_PROVIDER="chapa", CHAPA_SECRET_KEY="test-secret-key")
    @patch("apps.shared.payment.providers.chapa.requests.get")
    def test_verify_returns_normalized_shape(self, mock_get):
        """verify_payment() normalizes the Chapa verification response."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "status": "success",
            "data": {
                "amount": 500.0,
                "currency": "ETB",
                "tx_ref": "TX-VERIFY-001",
            },
        }
        mock_get.return_value = mock_response

        result = verify_payment("TX-VERIFY-001")

        # Verify normalized shape
        self.assertIn("status", result)
        self.assertIn("reference", result)
        self.assertIn("amount", result)
        self.assertIn("currency", result)
        self.assertIn("raw", result)

        self.assertEqual(result["status"], "success")
        self.assertEqual(result["reference"], "TX-VERIFY-001")
        self.assertEqual(result["amount"], 500.0)
        self.assertEqual(result["currency"], "ETB")

    @override_settings(PAYMENT_PROVIDER="chapa", CHAPA_SECRET_KEY="test-secret-key")
    @patch("apps.shared.payment.providers.chapa.requests.get")
    def test_verify_raises_on_http_failure(self, mock_get):
        """verify_payment() raises PaymentVerificationError on non-200 status."""
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_response.text = "Not Found"
        mock_get.return_value = mock_response

        with self.assertRaises(PaymentVerificationError):
            verify_payment("TX-NOTFOUND-001")

    @override_settings(PAYMENT_PROVIDER="chapa", CHAPA_SECRET_KEY="test-secret-key")
    @patch("apps.shared.payment.providers.chapa.requests.get")
    def test_verify_raises_on_network_error(self, mock_get):
        """verify_payment() raises PaymentVerificationError on network failure."""
        import requests as requests_lib

        mock_get.side_effect = requests_lib.ConnectionError("Network error")

        with self.assertRaises(PaymentVerificationError):
            verify_payment("TX-NET-001")
