"""API-level tests for the audit log endpoints.

Validates permission enforcement (Super Admin only), list/detail happy
paths, and query-parameter filtering.
"""

import uuid

from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from apps.accounts.models import User, Branch, UserAssignment
from apps.accounts.constants import Roles
from apps.shared.audit.services import log_action


class AuditAPIPermissionTests(TestCase):
    """Ensure only Super Admin users can access the audit API."""

    def setUp(self):
        """Create users with different roles."""
        self.client = APIClient()

        # Super Admin
        self.super_admin = User.objects.create_user(
            email="superadmin@test.com",
            password="testpass123",
            first_name="Super",
            last_name="Admin",
            status="Active",
        )
        UserAssignment.objects.create(
            user=self.super_admin,
            role=Roles.SUPER_ADMIN,
            is_active=True,
        )

        # Regular user (no role assignment)
        self.regular_user = User.objects.create_user(
            email="regular@test.com",
            password="testpass123",
            first_name="Regular",
            last_name="User",
            status="Active",
        )

    def test_unauthenticated_user_denied(self):
        """Unauthenticated requests receive 401."""
        response = self.client.get("/api/v1/audit/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_non_super_admin_denied(self):
        """Authenticated users without Super Admin role receive 403."""
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get("/api/v1/audit/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_super_admin_allowed(self):
        """Super Admin users can access the audit list."""
        self.client.force_authenticate(user=self.super_admin)
        response = self.client.get("/api/v1/audit/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class AuditAPIListDetailTests(TestCase):
    """Test list and detail endpoints for audit logs."""

    def setUp(self):
        """Set up Super Admin user and seed audit data."""
        self.client = APIClient()

        self.super_admin = User.objects.create_user(
            email="superadmin@test.com",
            password="testpass123",
            first_name="Super",
            last_name="Admin",
            status="Active",
        )
        UserAssignment.objects.create(
            user=self.super_admin,
            role=Roles.SUPER_ADMIN,
            is_active=True,
        )
        self.client.force_authenticate(user=self.super_admin)

        self.branch = Branch.objects.create(name="Audit Branch", code="ADB")

        self.entry = log_action(
            actor=self.super_admin,
            action="user.created",
            resource_type="Branch",
            resource_id=self.branch.id,
            branch=self.branch,
            ip_address="10.0.0.1",
            user_agent="TestAgent/1.0",
        )

    def test_list_returns_entries(self):
        """GET /api/v1/audit/ returns seeded audit entries."""
        response = self.client.get("/api/v1/audit/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", response.data) if isinstance(response.data, dict) else response.data
        self.assertGreaterEqual(len(results), 1)

    def test_detail_returns_entry(self):
        """GET /api/v1/audit/{id}/ returns the specific entry."""
        response = self.client.get(f"/api/v1/audit/{self.entry.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], str(self.entry.id))

    def test_detail_nests_actor(self):
        """Detail response includes nested actor {id, email, full_name}."""
        response = self.client.get(f"/api/v1/audit/{self.entry.id}/")
        actor = response.data["actor"]
        self.assertEqual(actor["id"], str(self.super_admin.id))
        self.assertEqual(actor["email"], self.super_admin.email)
        self.assertEqual(actor["full_name"], self.super_admin.full_name)

    def test_detail_nests_branch(self):
        """Detail response includes nested branch {id, name, code}."""
        response = self.client.get(f"/api/v1/audit/{self.entry.id}/")
        branch = response.data["branch"]
        self.assertEqual(branch["id"], str(self.branch.id))
        self.assertEqual(branch["name"], self.branch.name)
        self.assertEqual(branch["code"], self.branch.code)

    def test_no_create_endpoint(self):
        """POST /api/v1/audit/ is not allowed (read-only viewset)."""
        response = self.client.post("/api/v1/audit/", data={})
        self.assertIn(response.status_code, [
            status.HTTP_405_METHOD_NOT_ALLOWED,
            status.HTTP_403_FORBIDDEN,
        ])


class AuditAPIFilterTests(TestCase):
    """Test query-parameter filters on the audit list endpoint."""

    def setUp(self):
        """Set up Super Admin and create entries for filtering."""
        self.client = APIClient()

        self.super_admin = User.objects.create_user(
            email="superadmin@test.com",
            password="testpass123",
            first_name="Super",
            last_name="Admin",
            status="Active",
        )
        UserAssignment.objects.create(
            user=self.super_admin,
            role=Roles.SUPER_ADMIN,
            is_active=True,
        )
        self.client.force_authenticate(user=self.super_admin)

        self.branch = Branch.objects.create(name="Filter Branch", code="FLT")

        # Create multiple entries with varying attributes
        self.entry_create = log_action(
            actor=self.super_admin,
            action="user.created",
            resource_type="User",
            resource_id=uuid.uuid4(),
            branch=self.branch,
        )
        self.entry_login = log_action(
            actor=self.super_admin,
            action="user.login",
            resource_type="Session",
            resource_id=uuid.uuid4(),
        )

    def test_filter_by_action(self):
        """Filtering by action=CREATE returns only CREATE entries."""
        response = self.client.get("/api/v1/audit/", {"action": "CREATE"})
        results = response.data.get("results", response.data) if isinstance(response.data, dict) else response.data
        for entry in results:
            self.assertEqual(entry["action"], "CREATE")

    def test_filter_by_resource_type(self):
        """Filtering by resource_type returns matching entries only."""
        response = self.client.get("/api/v1/audit/", {"resource_type": "Session"})
        results = response.data.get("results", response.data) if isinstance(response.data, dict) else response.data
        self.assertTrue(len(results) >= 1)
        for entry in results:
            self.assertEqual(entry["resource_type"], "Session")

    def test_filter_by_actor(self):
        """Filtering by actor UUID returns entries from that actor."""
        response = self.client.get(
            "/api/v1/audit/", {"actor": str(self.super_admin.id)}
        )
        results = response.data.get("results", response.data) if isinstance(response.data, dict) else response.data
        self.assertTrue(len(results) >= 2)

    def test_filter_by_branch(self):
        """Filtering by branch UUID returns only branch-scoped entries."""
        response = self.client.get(
            "/api/v1/audit/", {"branch": str(self.branch.id)}
        )
        results = response.data.get("results", response.data) if isinstance(response.data, dict) else response.data
        self.assertTrue(len(results) >= 1)
        for entry in results:
            self.assertIsNotNone(entry["branch"])
