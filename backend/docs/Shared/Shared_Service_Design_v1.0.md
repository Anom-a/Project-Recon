# Project Recon

# Shared Services Design v1.0

**Status:** 🔒 LOCKED BEFORE IMPLEMENTATION

**App:** `shared`

---

# 1. Philosophy

The Shared app exists to provide reusable infrastructure for business modules.

It contains **no business logic**.

It contains **no business workflows**.

Business modules remain responsible for deciding **when** and **why** shared services are called.

Shared services simply provide infrastructure capabilities.

---

# 2. Services Overview

The Shared app contains exactly **three services**.

```text
shared/
│
├── audit/
│   └── services.py
│
├── email/
│   └── services.py
│
└── payment/
    └── services.py
```

No additional services should be added unless there is a concrete business requirement.

---

# 3. AuditService

## Purpose

Provide a centralized way to create immutable audit records.

AuditService never:

- modifies business data
- performs authorization
- executes business workflows

It only creates audit records.

---

## Public API

### log_action()

Creates a new audit record.

### Parameters

```python
actor
action
resource_type
resource_id
branch=None
ip_address=None
user_agent=None
```

### Returns

```python
AuditLog
```

---

## Example

```python
AuditService.log_action(
    actor=request.user,
    action=AuditAction.CREATE,
    resource_type="Branch",
    resource_id=branch.id,
    branch=branch,
    ip_address=request.META.get("REMOTE_ADDR"),
    user_agent=request.META.get("HTTP_USER_AGENT"),
)
```

---

## Rules

- Always create records.
- Never update records.
- Never delete records.
- Never swallow exceptions.
- Never modify business models.
- Never call business services.
- Never start database transactions.

---

## Used By

- Accounts
- Academic
- Events
- Store
- CMS

---

# 4. EmailService

## Purpose

Provide one unified interface for sending emails.

Business modules never communicate with email providers directly.

---

## Responsibilities

- Select the configured provider.
- Validate provider configuration.
- Send plain-text emails.
- Raise consistent exceptions.

---

## Public API

### send_email()

### Parameters

```python
to
subject
message
```

### Returns

```python
True
```

### Raises

```python
EmailProviderError
```

---

## Provider Selection

The provider is selected from Django settings.

```python
settings.EMAIL_PROVIDER
```

Example

```env
EMAIL_PROVIDER=smtp
```

Supported providers

- SMTP
- SendGrid (future)
- AWS SES (future)

---

## Internal Flow

```text
Business Module
        │
        ▼
 EmailService
        │
        ▼
Configured Provider
        │
        ▼
SMTP / SendGrid / SES
```

---

## Rules

- Plain text only.
- No HTML templates.
- No template rendering.
- No OTP generation.
- No verification logic.
- No retry logic.
- No queueing.
- No business workflows.

---

## Used By

Accounts

- Email Verification
- Login OTP
- Password Reset

Academic

- Registration Notifications

Events

- Event Notifications

Store

- Order Confirmation

CMS

- Contact Messages

---

# 5. PaymentService

## Purpose

Provide a provider-independent payment interface.

Business modules never communicate directly with payment providers.

---

## Responsibilities

- Initialize payments.
- Verify payments.
- Select configured provider.
- Normalize provider responses.

---

## Public API

### initialize_payment()

### Parameters

```python
amount
currency
reference
callback_url
customer
```

### Returns

Provider response.

---

### verify_payment()

### Parameters

```python
reference
```

### Returns

Verification result.

---

## Provider Selection

```python
settings.PAYMENT_PROVIDER
```

Example

```env
PAYMENT_PROVIDER=chapa
```

Supported providers

- Chapa
- Stripe (future)

---

## Internal Flow

```text
Business Module
        │
        ▼
 PaymentService
        │
        ▼
Configured Provider
        │
        ▼
Chapa / Stripe
```

---

## Rules

- Never create orders.
- Never update payments.
- Never modify business models.
- Never determine business success/failure.
- Never perform refunds unless explicitly requested by business services.
- Only communicate with payment providers.

---

## Used By

- Store
- Academic
- Events

---

# 6. Service Communication Rules

Business modules communicate with Shared.

Shared communicates with external infrastructure.

```text
Business Apps
      │
      ▼
──────────────────────────
AuditService
EmailService
PaymentService
──────────────────────────
      │
      ▼
Database / External APIs
```

Shared services must never communicate with business services.

Shared must never import business modules.

---

# 7. Error Handling

Each service exposes its own exceptions.

Examples

```text
AuditError

EmailProviderError

PaymentProviderError
```

Business modules decide how to handle these exceptions.

---

# 8. Transactions

Shared services never create database transactions.

Transactions belong to business services.

Example

```text
UserService

↓

transaction.atomic()

↓

AuditService.log_action()

↓

EmailService.send_email()
```

---

# 9. Dependency Rules

Allowed

```text
Business Apps
      │
      ▼
    Shared
```

Forbidden

```text
Shared
  │
  ▼
Business Apps
```

---

# 10. Design Rules

Every Shared service must:

- Have a single responsibility.
- Expose a small public API.
- Hide provider implementations.
- Be stateless.
- Never contain business workflows.
- Never import business modules.
- Never depend on another business service unless absolutely required.

---

# 11. Future Expansion

Future infrastructure services may include:

```text
SmsService

PushNotificationService
```

These should only be added when a real business requirement exists.

---

# 12. Service Decision Log

| Decision | Choice |
|----------|--------|
| Services | Audit, Email, Payment |
| Public APIs | Minimal |
| Provider Pattern | Yes |
| Registry Pattern | No |
| Base Provider Class | No |
| Email Templates | No |
| HTML Emails | No |
| Plain Text Emails | Yes |
| Business Logic | Never |
| Transactions | Business Layer |
| Retry Logic | No |
| Queueing | No |
| Provider Selection | Django Settings |
| Service State | Stateless |

---

# 13. Architecture Summary

```text
Business Apps
        │
        ▼
────────────────────────────
AuditService
EmailService
PaymentService
────────────────────────────
        │
        ▼
Database / External Providers
```

---

# 14. Locked Rules

- Shared owns infrastructure only.
- Business modules decide when to call shared services.
- Shared services never own business workflows.
- Shared services never modify business entities.
- Provider implementations remain hidden behind services.
- All provider selection is configuration-driven through Django settings.
- Shared never imports business apps.
- Shared remains independent of every business domain.

---

# Status

**🔒 LOCKED**