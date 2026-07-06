"""Payment provider configuration.

Reads provider selection and Chapa API credentials from environment
variables via ``django-environ`` and exposes them as Django settings
consumed by ``apps.shared.payment.services``.

Settings defined here:
    PAYMENT_PROVIDER: Active provider key (chapa | stripe).
    CHAPA_SECRET_KEY: Chapa API secret key.
"""

import environ

env = environ.Env()

# Provider selection
PAYMENT_PROVIDER = env("PAYMENT_PROVIDER", default="chapa")

# Chapa configuration (used when PAYMENT_PROVIDER=chapa)
CHAPA_SECRET_KEY = env("CHAPA_SECRET_KEY", default="")
