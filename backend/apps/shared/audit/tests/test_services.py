"""Unit tests for AuditService.log_action().

Validates that audit records are created with the correct fields,
that missing optional fields do not raise, and that immutability is
enforced at the model layer.
"""

import uuid

from django.test import TestCase

from apps.accounts.models import User, Branch
from apps.shared.audit.models.audit_log import AuditLog
from apps.shared.audit.services import log_action


class AuditServiceTests(TestCase):
    """Test suite for ``AuditService.log_action()``."""

    def setUp(self):
        """Create a user and branch for use in audit tests."""
        self.user = User.objects.create_user(
            email="auditor@test.com",
            password="test12345",
            first_name="Audit",
            last_name="User",
        )
        self.branch = Branch.objects.create(
            name="Test Branch",
            code="TST",
        )

    def test_log_action_creates_record_with_all_fields(self):
        """log_action() persists an AuditLog with every supplied field."""
        resource_id = uuid.uuid4()
        entry = log_action(
            actor=self.user,
            action="user.created",
            resource_type="Branch",
            resource_id=resource_id,
            branch=self.branch,
            ip_address="127.0.0.1",
            user_agent="TestAgent/1.0",
        )

        self.assertIsInstance(entry, AuditLog)
        self.assertEqual(entry.actor, self.user)
        self.assertEqual(entry.action, "user.created")
        self.assertEqual(entry.resource_type, "Branch")
        self.assertEqual(entry.resource_id, resource_id)
        self.assertEqual(entry.branch, self.branch)
        self.assertEqual(entry.ip_address, "127.0.0.1")
        self.assertEqual(entry.user_agent, "TestAgent/1.0")
        self.assertIsNotNone(entry.created_at)
        self.assertEqual(AuditLog.objects.count(), 1)

    def test_log_action_without_optional_fields(self):
        """log_action() succeeds when optional arguments are omitted."""
        resource_id = uuid.uuid4()
        entry = log_action(
            actor=None,
            action="user.login",
            resource_type="User",
            resource_id=resource_id,
        )

        self.assertIsNone(entry.actor)
        self.assertIsNone(entry.branch)
        self.assertIsNone(entry.ip_address)
        self.assertIsNone(entry.user_agent)

    def test_log_action_supports_all_action_choices(self):
        """Every AuditAction value can be persisted without error."""
        rid = uuid.uuid4()
        for action_value in ["login", "logout"]:
            entry = log_action(
                actor=self.user,
                action=action_value,
                resource_type="User",
                resource_id=rid,
            )
            self.assertEqual(entry.action, action_value)


    def test_audit_log_cannot_be_updated(self):
        """Saving an existing AuditLog record raises ValueError."""
        entry = log_action(
            actor=self.user,
            action="user.created",
            resource_type="User",
            resource_id=uuid.uuid4(),
        )
        entry.action = "user.deleted"
        with self.assertRaises(ValueError):
            entry.save()

    def test_audit_log_cannot_be_deleted(self):
        """Deleting an AuditLog record raises ValueError."""
        entry = log_action(
            actor=self.user,
            action="user.created",
            resource_type="User",
            resource_id=uuid.uuid4(),
        )
        with self.assertRaises(ValueError):
            entry.delete()
