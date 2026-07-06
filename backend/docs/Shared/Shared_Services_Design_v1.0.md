# Project Recon

# Shared App Architecture v1.0

**Status:** Locked Before Implementation

**App:** `shared`

**Purpose:** Provide reusable infrastructure services used by multiple business modules while remaining completely independent of business logic.

---

# 1. Purpose

The **Shared** app contains infrastructure that:

- Is used by multiple business apps.
- Is not already provided by Django or Django REST Framework.
- Is independent of any business domain.

It **never owns business entities** or **business workflows**.

---

# 2. Architecture Principles

The Shared app follows the Project Recon engineering principles.

## Django First

If Django already provides a feature, use it.

Do not build wrappers around Django.

Examples:

- File Storage → Django Storage
- Static Files → Django
- Authentication → Django Auth
- Responses → DRF Response
- Validation → Django/DRF Validators

## Infrastructure Only

Shared contains reusable infrastructure only.

No business rules.

No business workflows.

No business models.

## Keep It Simple

Avoid unnecessary abstractions.

Only create additional layers when they solve a real problem.

## Provider Pattern

External services supporting multiple providers use the Provider Pattern.

Provider selection is configured through `.env` and Django settings.

---

# 3. Responsibilities

Shared currently owns only three infrastructure domains.

```text
shared/
│
├── audit/
├── email/
└── payment/
```

Future additions (only when needed):

```text
sms/
notification/
```

---

# 4. What Shared Does NOT Own

Shared never owns:

- Users
- Branches
- Students
- Products
- Orders
- Events
- Roles
- Authentication
- OTPs
- Email Verification
- Password Reset Logic
- Business Permissions
- Storage
- Celery
- Static Files
- Validators
- Exceptions
- Response Helpers

---

# 5. Dependency Rules

Business modules may depend on Shared.

```text
accounts
academic
events
store
cms
      │
      ▼
    shared
```

Shared must never import or depend on any business module.

---

# 6. Folder Structure

```text
shared/
│
├── audit/
│   ├── models/
│   │   ├── __init__.py
│   │   └── audit_log.py
│   ├── api/
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── permissions.py
│   ├── services.py
│   ├── admin.py
│   └── tests/
│
├── email/
│   ├── providers/
│   │   ├── smtp.py
│   │   ├── sendgrid.py
│   │   └── ses.py
│   ├── services.py
│   └── tests/
│
├── payment/
│   ├── providers/
│   │   ├── chapa.py
│   │   └── stripe.py
│   ├── services.py
│   └── tests/
│
├── apps.py
└── __init__.py
```

---

# 7. Email Infrastructure

Purpose:

Provide a unified email sending interface.

Business modules communicate only with `EmailService`.

Responsibilities:

- Select configured provider.
- Send plain-text emails.
- Hide provider implementations.
- Raise consistent errors.

Supported providers:

- SMTP
- SendGrid (future)
- AWS SES (future)

Configuration lives in `config/integrations/email.py`.

Email does **not** own OTP generation, verification workflows, password reset workflows, or business logic.

---

# 8. Payment Infrastructure

Purpose:

Provide a unified payment interface.

Business modules communicate only with `PaymentService`.

Responsibilities:

- Initialize payments.
- Verify payments.
- Hide provider implementations.

Supported providers:

- Chapa
- Stripe (future)

Configuration lives in `config/integrations/payment.py`.

Business payment workflows remain inside business apps.

---

# 9. Audit Infrastructure

Purpose:

Maintain an immutable audit trail for accountability and security.

AuditLog fields:

- id
- actor
- action
- resource_type
- resource_id
- branch
- ip_address
- user_agent
- created_at

Rules:

- Immutable
- Never updated
- Never deleted
- Written only through `AuditService`
- Read-only API
- Does not trigger business logic
- Does not modify business data

API:

- GET /api/v1/audit/
- GET /api/v1/audit/{id}/

---

# 10. External Configuration

External integrations live under:

```text
config/
├── settings.py
└── integrations/
    ├── email.py
    ├── payment.py
    ├── celery.py
    ├── sms.py
    └── storage.py
```

Shared never reads `.env` directly.

It only reads Django settings.

---

# 11. Cross Module Usage

- Accounts → EmailService / AuditService
- Academic → PaymentService / AuditService
- Events → PaymentService / AuditService
- Store → PaymentService / AuditService
- CMS → EmailService / AuditService

---

# 12. Design Rules

- Shared owns infrastructure only.
- Shared never imports business modules.
- Shared never duplicates Django functionality.
- External services support multiple providers.
- Provider selection is configuration-driven.
- Business modules communicate only with Shared services.

---

# 13. Architecture Decision Log

| Decision | Choice |
|----------|--------|
| Purpose | Infrastructure Only |
| Domains | Audit, Email, Payment |
| Storage | Django Storage |
| Static Files | Django |
| Authentication | Django |
| Responses | DRF |
| Validators | Django/App-specific |
| Exceptions | Django/App-specific |
| Celery | Config only |
| Provider Configuration | config/integrations |
| Provider Implementations | shared |
| Audit API | shared.audit |
| Audit Records | Immutable |

**Status:** LOCKED
