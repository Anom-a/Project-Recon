import sys
from django.core.mail import send_mail
from django.conf import settings
from apps.shared.audit.services import log_action

TESTING = 'test' in sys.argv


def send_email(to: str, subject: str, body: str) -> bool:
    """
    Send email using configured backend.
    """

    sent = send_mail(
        subject,
        body,
        settings.DEFAULT_FROM_EMAIL,
        [to],
        fail_silently=False,
    )

    log_action(None, "EMAIL_SENT", "Email", None, details={"to": to, "subject": subject})

    if settings.DEBUG or TESTING:
        sys.stderr.write(f"\n{'=' * 60}\n")
        sys.stderr.write(f"📧 EMAIL SENT\n")
        sys.stderr.write(f"   To:      {to}\n")
        sys.stderr.write(f"   Subject: {subject}\n")
        sys.stderr.write(f"   From:    {settings.DEFAULT_FROM_EMAIL}\n")
        sys.stderr.write(f"   Body:\n")
        sys.stderr.write(f"{body}\n")
        sys.stderr.write(f"{'=' * 60}\n\n")

    return sent == 1
