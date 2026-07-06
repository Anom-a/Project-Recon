"""Comprehensive email sending service tests."""
from django.test import TestCase, override_settings
from django.core import mail
from apps.shared.email.services import send_email


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    DEFAULT_FROM_EMAIL="noreply@example.com",
)
class SendEmailLocmemTests(TestCase):
    """Email delivery tests using the locmem outbox."""

    def test_send_email_delivers_to_outbox(self):
        result = send_email(
            to="test@example.com",
            subject="Welcome",
            body="Welcome to the platform.",
        )
        self.assertTrue(result)
        self.assertEqual(len(mail.outbox), 1)

    def test_send_email_correct_recipient(self):
        send_email(to="user@test.com", subject="Hi", body="Body")
        self.assertEqual(mail.outbox[0].to, ["user@test.com"])

    def test_send_email_correct_subject(self):
        send_email(to="a@b.com", subject="Test Subject", body="Body")
        self.assertEqual(mail.outbox[0].subject, "Test Subject")

    def test_send_email_correct_body(self):
        send_email(to="a@b.com", subject="S", body="Hello World")
        self.assertIn("Hello World", mail.outbox[0].body)

    def test_send_email_from_address(self):
        send_email(to="a@b.com", subject="S", body="B")
        self.assertEqual(mail.outbox[0].from_email, "noreply@example.com")

    def test_send_email_multiple_recipients(self):
        send_email(to="first@test.com", subject="S", body="B")
        send_email(to="second@test.com", subject="S", body="B")
        self.assertEqual(len(mail.outbox), 2)
        self.assertEqual(mail.outbox[0].to, ["first@test.com"])
        self.assertEqual(mail.outbox[1].to, ["second@test.com"])

    def test_send_email_empty_body(self):
        result = send_email(to="a@b.com", subject="S", body="")
        self.assertTrue(result)
        self.assertEqual(len(mail.outbox), 1)
