"""
Centralized email configuration for Project Recon.
Supports console, SMTP, and AnyMail providers.
"""

import os
from django.core.exceptions import ImproperlyConfigured


# ---------------------------------------------------
# ENV HELPERS
# ---------------------------------------------------

def env_bool(name, default=False):
    return os.getenv(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}


def env_int(name, default):
    value = os.getenv(name)
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


# ---------------------------------------------------
# PROVIDER SELECTION
# ---------------------------------------------------

EMAIL_PROVIDER = os.getenv("EMAIL_PROVIDER", "console").lower()


# ---------------------------------------------------
# BACKENDS
# ---------------------------------------------------

EMAIL_BACKENDS = {
    "console": "django.core.mail.backends.console.EmailBackend",
    "smtp": "django.core.mail.backends.smtp.EmailBackend",
    "sendgrid": "anymail.backends.sendgrid.EmailBackend",
    "brevo": "anymail.backends.brevo.EmailBackend",
    "mailgun": "anymail.backends.mailgun.EmailBackend",
    "mailersend": "anymail.backends.mailersend.EmailBackend",
    "postmark": "anymail.backends.postmark.EmailBackend",
    "ses": "anymail.backends.amazon_ses.EmailBackend",
}


def get_email_backend():
    try:
        return EMAIL_BACKENDS[EMAIL_PROVIDER]
    except KeyError:
        raise ImproperlyConfigured(
            f"Invalid EMAIL_PROVIDER='{EMAIL_PROVIDER}'. "
            f"Choose from: {', '.join(EMAIL_BACKENDS.keys())}"
        )


EMAIL_BACKEND = get_email_backend()


# ---------------------------------------------------
# SMTP CONFIG (only used if EMAIL_PROVIDER=smtp)
# ---------------------------------------------------

EMAIL_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
EMAIL_PORT = env_int("SMTP_PORT", 587)
EMAIL_HOST_USER = os.getenv("SMTP_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("SMTP_PASSWORD", "")
EMAIL_USE_TLS = env_bool("SMTP_USE_TLS", True)
EMAIL_USE_SSL = env_bool("SMTP_USE_SSL", False)


# ---------------------------------------------------
# DEFAULT EMAIL SETTINGS
# ---------------------------------------------------

DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "noreply@recon.local")


# ---------------------------------------------------
# ANYMAIL CONFIG
# ---------------------------------------------------

ANYMAIL = {}

if EMAIL_PROVIDER in EMAIL_BACKENDS:

    key_map = {
        "sendgrid": "SENDGRID_API_KEY",
        "brevo": "BREVO_API_KEY",
        "mailgun": "MAILGUN_API_KEY",
        "mailersend": "MAILERSEND_API_TOKEN",
        "postmark": "POSTMARK_SERVER_TOKEN",
        "ses": None,
    }

    key_name = key_map.get(EMAIL_PROVIDER)

    if key_name:
        api_key = os.getenv(key_name)

        if not api_key:
            raise ImproperlyConfigured(
                f"{EMAIL_PROVIDER} requires {key_name} in .env"
            )

        ANYMAIL = {key_name: api_key}
    else:
        ANYMAIL = {}  # SES uses AWS credentials automatically


# ---------------------------------------------------
# APP SETTINGS
# ---------------------------------------------------

EMAIL_VERIFICATION_TOKEN_TTL_MINUTES = env_int(
    "EMAIL_VERIFICATION_TOKEN_TTL_MINUTES",
    30,
)

LOGIN_OTP_TTL_MINUTES = env_int(
    "LOGIN_OTP_TTL_MINUTES",
    10,
)

FRONTEND_VERIFY_EMAIL_URL = os.getenv(
    "FRONTEND_VERIFY_EMAIL_URL",
    "https://recon.app/verify-email",
)