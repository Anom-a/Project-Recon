"""Shared fixtures for accounts API tests."""

from django.test import override_settings
from rest_framework.test import APITestCase
from rest_framework.throttling import SimpleRateThrottle

from apps.accounts.models import Branch
from apps.accounts.services import user_service


_TEST_THROTTLE_RATES = {
    "anon_login": "1000/min",
    "anon_forgot_password": "1000/min",
    "anon_reset_password": "1000/min",
    "user_otp_request": "1000/min",
    "user_otp_verify": "1000/min",
}


@override_settings(AUTH_REQUIRE_DEVICE_VERIFICATION=False)
class AccountsAPITestCase(APITestCase):
    """Base API test case with super admin, branch, and JWT helpers."""

    base_url = "/api/v1/accounts"

    def setUp(self):
        self.password = "StrongP@ssw0rd!2026"
        self.super_admin = user_service.create_super_admin(
            "admin@test.com", "Super", "Admin", self.password
        )
        self.branch = Branch.objects.create(name="Main Branch", code="MB01")
        self.student = user_service.create_student_user(
            "student@test.com", "Student", "User", self.password, self.branch
        )
        user_service.activate_user(self.student)
        self.student.is_email_verified = True
        self.student.save()
        # DRF caches SimpleRateThrottle.THROTTLE_RATES at import time,
        # so override_settings(REST_FRAMEWORK=...) has no effect on it.
        # Patch the class attribute directly instead.
        self._old_throttle_rates = SimpleRateThrottle.THROTTLE_RATES
        SimpleRateThrottle.THROTTLE_RATES = {**SimpleRateThrottle.THROTTLE_RATES, **_TEST_THROTTLE_RATES}

    def tearDown(self):
        SimpleRateThrottle.THROTTLE_RATES = self._old_throttle_rates
        super().tearDown()

    def _login(self, email=None, password=None, extra=None):
        """Return login response JSON data envelope."""
        data = {"email": email or self.student.email, "password": password or self.password}
        if extra:
            data.update(extra)
        response = self.client.post(
            f"{self.base_url}/login/",
            data,
            format="json",
        )
        return response

    def authenticate_as(self, user=None):
        """Attach JWT credentials for the given user (defaults to super admin)."""
        email = user.email if user else self.super_admin.email
        response = self._login(email=email, password=self.password)
        token = response.json()["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
