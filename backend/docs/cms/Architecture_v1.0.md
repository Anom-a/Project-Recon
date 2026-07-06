# Project Recon

# CMS Architecture & Database Design v1.1

**Status:** Locked

**App:** `cms`

---

# 1. Purpose

The CMS (Content Management System) is responsible for managing all public-facing website content and public communication.

It provides data to the frontend but **never controls presentation**.

The frontend is responsible for:

- Layout
- Styling
- Animations
- Component placement
- Responsive behavior
- User experience

The backend simply stores content and exposes secure APIs.

---

# 2. Design Philosophy

The CMS follows the same core principles as the rest of Project Recon.

## Django First

Whenever Django already provides a solution, use it.

Do not reinvent existing functionality.

---

## Keep It Simple

The CMS is **not** a website builder.

It is **not** a page builder.

It is **not** a drag-and-drop editor.

It stores structured data only.

---

## Frontend Controls Presentation

The frontend decides:

- How hero banners are displayed
- Whether banners rotate
- Card layouts
- Colors
- Typography
- Animations
- Section ordering

The backend only stores data.

---

## Structured Content

Every piece of content has its own model.

No JSON blocks.

No dynamic page builders.

No rich layout editors.

---

# 3. CMS Responsibilities

The CMS owns:

- Hero Banners
- News & Announcements
- Sponsors & Partners
- About Us
- Contact Requests
- Frequently Asked Questions (FAQ)

---

# 4. CMS Does NOT Own

The CMS never owns:

- Users
- Authentication
- Students
- Courses
- Enrollments
- Events
- Products
- Orders
- Payments
- Email Sending
- Audit Logs

Those belong to their respective apps.

---

# 5. Folder Structure

```text
cms/
│
├── models/
│   ├── hero_banner.py
│   ├── news.py
│   ├── partner.py
│   ├── about.py
│   ├── contact_request.py
│   └── faq.py
│
├── services/
│
├── api/
│   ├── serializers/
│   ├── views/
│   ├── urls.py
│   └── permissions.py
│
├── admin.py
├── apps.py
└── tests/
```

---

# 6. Database Overview

The CMS contains exactly six models.

```text
CMS

├── HeroBanner
├── NewsArticle
├── Partner
├── AboutUs
├── ContactRequest
└── FAQ
```

---

# 7. HeroBanner

## Purpose

Stores content for the homepage hero section.

The frontend decides how banners are displayed.

---

## Fields

```text
id

title
subtitle
description

image (nullable)
video_url (nullable)

button_text (nullable)
button_url (nullable)

is_active

created_at
updated_at
```

---

## Validation Rules

- Either `image` or `video_url` must be provided.
- Both cannot be provided simultaneously.
- If `button_text` is provided, `button_url` is required.
- If `button_url` is provided, `button_text` is required.
- Multiple active banners are allowed.

---

# 8. News & Announcements

## Purpose

Stores institute news and announcements.

A single model manages both.

---

## Fields

```text
id

title
slug

summary
content

image (nullable)
video_url (nullable)

button_text (nullable)
button_url (nullable)

type

is_active

published_at

created_at
updated_at
```

---

## Type

Implemented using Django TextChoices.

```text
NEWS

ANNOUNCEMENT
```

---

## Validation Rules

- Slug must be unique.
- Image and video are optional.
- If media is provided, only one of `image` or `video_url` may be used.
- If `button_text` exists, `button_url` is required.
- If `button_url` exists, `button_text` is required.
- `published_at` defaults to the creation date but may be changed by staff.

---

# 9. Sponsors & Partners

## Purpose

Manage organizations associated with the institute.

---

## Fields

```text
id

title

description

image

website_url

type

is_active

created_at
updated_at
```

---

## Type

Implemented using Django TextChoices.

```text
SPONSOR

PARTNER
```

---

## Validation Rules

- Image is required.
- Website URL is optional.
- Type must be one of the defined choices.
- Multiple sponsors and partners are allowed.

---

# 10. About Us

## Purpose

Stores informational content about the institute.

Examples:

- Our Story
- Mission
- Vision
- Our Team
- Why Choose Us

The frontend decides where each section is displayed.

---

## Fields

```text
id

title

slug

description

is_active

created_at
updated_at
```

---

## Validation Rules

- Slug must be unique.
- Multiple About records are allowed.
- Only active records are exposed publicly.

---

# 11. Contact Request

## Purpose

Replaces the legacy Support Ticket system.

Allows anyone to contact the institute without requiring authentication.

A Contact Request is a single submission — there is no conversation thread. All follow-up communication happens externally (email, phone).

---

## Fields

```text
id

ticket_number

name

email

phone (nullable)

subject

description

attachment (nullable)

status

priority

created_at
updated_at
```

---

## Status

Implemented using Django TextChoices.

```text
OPEN

IN_PROGRESS

RESOLVED

CLOSED
```

---

## Priority

Implemented using Django TextChoices.

```text
LOW

MEDIUM

HIGH

URGENT
```

---

## Validation Rules

- `ticket_number` is generated automatically with `CR-` prefix.
- `ticket_number` must be unique.
- `name`, `email`, `subject`, and `description` are required.
- `phone` and `attachment` are optional.
- Records are hard deletable by Super Admin.

---

# 12. FAQ

## Purpose

Manage Frequently Asked Questions.

---

## Fields

```text
id

question

answer

is_active

created_at
updated_at
```

---

## Validation Rules

- Question is required.
- Answer is required.
- Only active FAQs are returned by public APIs.

---

# 13. General Model Standards

Every CMS model follows the Project Recon standards.

---

## Primary Key

Every model uses UUID.

```python
id = models.UUIDField(
    primary_key=True,
    default=uuid.uuid4,
    editable=False,
)
```

---

## Timestamps

Every model explicitly declares:

```text
created_at

updated_at
```

No shared BaseModel is used.

---

## Activation

Every public content model contains:

```text
is_active
```

Inactive content remains in the database but is hidden from public APIs.

---

## Slugs

Used only for public URLs.

Models requiring slugs:

- NewsArticle
- AboutUs

---

## Media

Images

Use Django ImageField.

Videos

Store external video links using URLField.

The CMS never stores uploaded videos.

---

## Text Choices

Use Django TextChoices for:

- News Type
- Partner Type
- Contact Status
- Contact Priority

No lookup tables are created for these values.

---

# 14. Relationships

All CMS models are independent.

There are no foreign key relationships between CMS models.

---

# 15. API Philosophy

Public APIs expose only active content (except Contact Requests, which are always visible once created).

Administrative APIs require Super Admin role.

The frontend is responsible for:

- Ordering
- Grouping
- Layout
- Display

The backend only provides content.

---

## Contact Request API Endpoints

### Public (no authentication required)

```text
POST /api/v1/cms/contact-requests/
```

### Admin (Super Admin only)

```text
GET    /api/v1/cms/admin/contact-requests/
POST   /api/v1/cms/admin/contact-requests/
GET    /api/v1/cms/admin/contact-requests/<uuid:pk>/
PATCH  /api/v1/cms/admin/contact-requests/<uuid:pk>/
DELETE /api/v1/cms/admin/contact-requests/<uuid:pk>/
```

---

# 16. Business Rules

- The CMS stores content only.
- The CMS never controls website layout.
- The CMS never performs business workflows.
- Multiple hero banners are supported.
- Multiple About sections are supported.
- News and announcements share one model.
- Sponsors and partners share one model.
- Contact Requests require no authentication.
- Contact Requests have no conversation thread — follow-up is external.
- Public APIs return only active records.
- Admin API access requires Super Admin role.
- Audit logging is handled by the Shared app.
- Email notifications are handled by the Shared app.

---

# 17. Architecture Decision Log

| Decision | Choice |
|----------|--------|
| Architecture | Structured CMS |
| Page Builder | No |
| JSON Content Blocks | No |
| Dynamic Layout Builder | No |
| Hero Banners | Yes |
| News & Announcements | One Model |
| Sponsors & Partners | One Model |
| About Us | Structured Model |
| FAQ | Yes |
| Contact Requests | Yes (replaces Support Tickets) |
| Ticket Conversations | No (communication is external) |
| Public Contact Request Creation | Yes |
| Anonymous Contact Request | Yes |
| Uploaded Videos | No |
| Video Storage | External URL |
| Images | Django ImageField |
| Active Flag | Yes |
| UUID | Yes |
| BaseModel | No |
| Audit Logging | Shared App |
| Email | Shared App |
| Frontend Controls Layout | Yes |
| Admin Role | Super Admin only |

---

# 18. Final Model List

```text
cms/

HeroBanner

NewsArticle

Partner

AboutUs

ContactRequest

FAQ
```

---

