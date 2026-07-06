"""Device API endpoint tests."""
from django.utils import timezone
from rest_framework import status

from apps.accounts.models import TrustedDevice
from apps.accounts.tests.api.base import AccountsAPITestCase


class DeviceAPITestCase(AccountsAPITestCase):
    """Trusted device list, detail, revoke tests."""

    def setUp(self):
        super().setUp()
        self.device = TrustedDevice.objects.create(
            user=self.student,
            device_id="d1",
            device_name="My Device",
            device_type="Mobile",
            fingerprint="fp-1",
            ip_address="127.0.0.1",
            last_used_at=timezone.now(),
            is_active=True,
        )
        self.other_device = TrustedDevice.objects.create(
            user=self.super_admin,
            device_id="d2",
            fingerprint="fp-admin",
            last_used_at=timezone.now(),
            is_active=True,
        )

    # -- List ------------------------------------------------

    def test_list_devices_for_current_user(self):
        self.authenticate_as(self.student)
        response = self.client.get(f"{self.base_url}/devices/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.json()[0]["fingerprint"], "fp-1")

    def test_list_devices_excludes_other_users_devices(self):
        self.authenticate_as(self.student)
        response = self.client.get(f"{self.base_url}/devices/")
        fingerprints = [d["fingerprint"] for d in response.json()]
        self.assertNotIn("fp-admin", fingerprints)

    def test_list_devices_unauthenticated_returns_401(self):
        response = self.client.get(f"{self.base_url}/devices/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # -- Detail ----------------------------------------------

    def test_get_device_detail(self):
        self.authenticate_as(self.student)
        response = self.client.get(
            f"{self.base_url}/devices/{self.device.id}/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["fingerprint"], "fp-1")

    def test_get_device_detail_nonexistent_returns_404(self):
        self.authenticate_as(self.student)
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = self.client.get(f"{self.base_url}/devices/{fake_id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_device_detail_other_user_returns_404(self):
        self.authenticate_as(self.student)
        response = self.client.get(
            f"{self.base_url}/devices/{self.other_device.id}/"
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # -- Delete ----------------------------------------------

    def test_delete_device(self):
        self.authenticate_as(self.student)
        response = self.client.delete(
            f"{self.base_url}/devices/{self.device.id}/"
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.device.refresh_from_db()
        self.assertFalse(self.device.is_active)

    def test_delete_device_nonexistent_returns_404(self):
        self.authenticate_as(self.student)
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = self.client.delete(
            f"{self.base_url}/devices/{fake_id}/"
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_unauthenticated_returns_401(self):
        response = self.client.delete(
            f"{self.base_url}/devices/{self.device.id}/"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # -- Revoke All ------------------------------------------

    def test_revoke_all_devices_except_current(self):
        TrustedDevice.objects.create(
            user=self.student,
            device_id="d-extra",
            fingerprint="fp-extra",
            last_used_at=timezone.now(),
            is_active=True,
        )
        self.authenticate_as(self.student)
        response = self.client.post(
            f"{self.base_url}/devices/revoke-all/",
            {"current_fingerprint": "fp-1"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.device.refresh_from_db()
        self.assertTrue(self.device.is_active)
        extra = TrustedDevice.objects.get(fingerprint="fp-extra")
        self.assertFalse(extra.is_active)

    def test_revoke_all_unauthenticated_returns_401(self):
        response = self.client.post(
            f"{self.base_url}/devices/revoke-all/",
            {"current_fingerprint": "fp-1"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
