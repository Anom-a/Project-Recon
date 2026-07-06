# Project Recon --- Architecture 

**Status:** Locked before implementation\
**Architecture:** Modular Monolith (Single Django Project)\
**Backend:** Django + Django REST Framework\
**Database:** PostgreSQL / SQLight for dev\
**Primary Goal:** Build a production-ready, scalable, maintainable
platform without unnecessary complexity.

## 1. System Overview

Project Recon is a unified platform that combines:

-   Academic management
-   Event & tournament management
-   E-commerce (gear store)
-   CMS & support system
-   Multi-branch management
-   Role-based access control
-   Payment integration
-   Email notifications

The system is built as **one Django project** with **multiple business
modules** that communicate through well-defined service interfaces.

## 2. Core Architecture Principles

### Non-Negotiable Rules

1.  One Django project (Modular Monolith).
2.  Each module owns its own business domain.
3.  Business modules never modify another module's models directly.
4.  Cross-module communication happens through public services.
5.  `shared` provides infrastructure only.
6.  Views remain thin.
7.  Business logic lives in services.
8.  Models define data and relationships only.
9.  External integrations are provider-based and configurable through
    `settings.py` and `.env`.
10. Every module follows the same internal structure.
11. Every model explicitly declares `id`, `created_at`, and
    `updated_at`.
12. UUID is the standard primary key.
13. Celery is supported but introduced only when needed.

## 3. Why Modular Monolith?

Project Recon is intentionally **not** a microservices architecture.

### Reasons

-   Easier deployment.
-   Simpler debugging.
-   Strong consistency for workflows such as:
    -   Registration → Enrollment → Payment → Notification.
-   Clear module boundaries without operational complexity.

This approach provides most of the benefits of microservices while
keeping the system easy to build and maintain.

## 4. General Project Folder Structure

``` text
project_recon/
├── config/
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
├── apps/
│   ├── accounts/
│   ├── academic/
│   ├── events/
│   ├── store/
│   ├── cms/
│   └── shared/
├── docs/
├── requirements.txt
├── scripts/
├── media/
├── static/
├── .env
├── manage.py
└── README.md
```

## 5. Modules

### accounts

Owns Users, Authentication, Branches, Roles, RBAC, Profiles.

### academic

Owns Students, Enrollment, Attendance, Learning Progress, Tracks, Tiers,
and Registration orchestration.

### events

Owns Events, Camps, Tournaments, Brackets, Registrations, Announcements.

### store

Owns Products, Categories, Inventory, Cart, Orders, Checkout.

### cms

Owns Homepage, Journey Map, Sponsors, News, Support Tickets, Parent
Messages.

### shared

Owns infrastructure only: Email, Payments, Storage, Permissions,
Validators, Exceptions, Utilities, Responses.

## 6. App Structure

``` text
app/
├── models/
├── services/
├── api/
│   └── urls.py
├── serializers/
├── views/
├── permissions/
├── signals/
├── tasks.py
├── validators.py
├── exceptions.py
├── constants.py
├── migrations/
└── tests/
```

## 7. Layer Responsibilities

-   **models/**: Data, relationships, constraints.
-   **services/**: Business logic and orchestration.
-   **views/**: Authentication, validation, service calls,
    responses.
-   **serializers/**: Validation and serialization.
-   **permissions/**: Module permissions.
-   **tasks.py**: Celery tasks.
-   **validators.py**: Reusable validators.
-   **exceptions.py**: Domain exceptions.
-   **constants.py**: Enums and choices.

## 8. Cross-Module Communication

Allowed:

``` python
from apps.store.services.order_service import create_order
from apps.accounts.services.user_service import get_user
```

Not allowed:

``` python
from apps.store.models import Order  # ❌
```

## 9. Signals Policy

Signals are limited to: - Audit logging - Analytics - Cache
invalidation - Infrastructure events

## 10. Shared Infrastructure

``` text
shared/
├── email/
├── payments/
├── storage/
├── permissions/
├── exceptions/
├── responses/
├── validators/
└── utils/
```

## 11. External Providers

Configured via `.env`:

``` text
EMAIL_PROVIDER=sendgrid
PAYMENT_PROVIDER=chapa
STORAGE_PROVIDER=local
```

``` python
EMAIL_PROVIDER = env("EMAIL_PROVIDER", default="smtp")
PAYMENT_PROVIDER = env("PAYMENT_PROVIDER", default="chapa")
```

## 12. Branching Strategy

-   Single PostgreSQL database.
-   Branches are organizational boundaries.
-   Branch model lives in `accounts`.
-   Access enforced through authorization and query filtering.

## 13. UUID Convention

``` python
id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
```

## 14. Model Convention

Every model explicitly declares: - `id` - `created_at` - `updated_at`

No shared `BaseModel`.

## 15. Celery Strategy

Business logic remains in services.

``` python
@shared_task
def send_welcome_email(user_id):
    send_welcome_email_service(user_id)
```

## 16. Deferred Decisions

-   RBAC schema
-   Domain models
-   API versioning
-   Caching
-   File storage
-   Search
-   Deployment
-   Monitoring
-   CI/CD
-   Security hardening

