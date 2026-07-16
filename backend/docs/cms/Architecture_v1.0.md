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
- Map Nodes (global achievement map)
- Gallery (photo/video gallery)
- Platform Stats (cross-app aggregate counts)

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
│   ├── faq.py
│   ├── map_node.py
│   └── gallery.py
│
├── services/
│   ├── hero_banner_service.py
│   ├── news_service.py
│   ├── partner_service.py
│   ├── about_service.py
│   ├── contact_request_service.py
│   ├── faq_service.py
│   ├── map_node_service.py
│   └── gallery_service.py
│
├── api/
│   ├── serializers/
│   ├── views/
│   ├── urls.py
│   └── permissions.py
│
├── admin.py
├── constants.py
├── apps.py
└── tests/
```

---

# 6. Database Overview

The CMS contains exactly eight models.

```text
CMS

├── HeroBanner
├── NewsArticle
├── Partner
├── AboutUs
├── ContactRequest
├── FAQ
├── MapNode
└── Gallery
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
- `published_at` is nullable and defaults to null.

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
- Attachment is validated by the shared file validator (rejects executables, scripts, files >10MB).
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

# 13. MapNode

## Purpose

Track global achievements on an interactive world map.

Each node represents a location where the institute has achieved something.

---

## Fields

```text
id
city
country
title
achievement
x
y
lat (nullable)
lng (nullable)
image (nullable)
category
is_active
created_at
updated_at
```

- `x` and `y` are FloatFields representing map position as percentages (0-100).
- `lat` and `lng` are optional coordinate strings.

---

## Category

Implemented using Django TextChoices.

```text
CHAMPIONSHIP
ACADEMIC
RESEARCH
STRATEGY
ALLIANCE
```

---

## Validation Rules

- Category must be one of the defined choices.
- Multiple nodes per category are allowed.
- Deletion is **soft** — sets `is_active = False` instead of removing the record.

---

# 14. Gallery

## Purpose

Manage a gallery of photos and videos for the website.

---

## Fields

```text
id
title
description
image (nullable)
video_url (nullable)
is_active
created_at
updated_at
```

---

## Validation Rules

- Only active items are returned by public APIs.
- Deletion is **hard** — record is removed from the database.
- Public detail endpoint returns 404 for inactive or non-existent items.

---

# 15. Platform Stats

## Purpose

Expose aggregate counts from multiple apps for the public website.

---

## Endpoint

```text
GET /api/v1/cms/stats/
```

Public, no authentication required.

Returns counts such as total students, courses, events, etc. by querying business app models directly.

---

# 16. General Model Standards

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
- MapNode Category

No lookup tables are created for these values.

---

# 17. Relationships

All CMS models are independent.

There are no foreign key relationships between CMS models.

---

# 18. Services

Every content model has a corresponding service module providing CRUD operations. Services are module-level functions (no classes).

## Common pattern

Each service exposes:

- `get_<model>_or_404(pk)` — retrieve or 404
- `list_<model>s()` — all records
- `list_active_<model>s()` — active only (public API)
- `create_<model>(data, actor=None)` — create with optional audit
- `update_<model>(instance, data, actor=None)` — partial update with optional audit
- `delete_<model>(instance, actor=None)` — delete with optional audit

## Audit behavior

- HeroBanner and ContactRequest services do **not** audit.
- All other services call `log_action()` from `apps.shared.audit.services`.

## Soft delete

- MapNode uses **soft delete** (sets `is_active=False`).
- All other models use **hard delete**.

---

# 19. API Philosophy

Public APIs expose only active content (except Contact Requests, which are always visible once created).

Administrative APIs require Super Admin role via `IsCMSStaff` permission.

The frontend is responsible for:

- Ordering
- Grouping
- Layout
- Display

The backend only provides content.

---

## Public Endpoints (no authentication required)

```text
GET    /api/v1/cms/hero-banners/
GET    /api/v1/cms/news/
GET    /api/v1/cms/news/<slug:slug>/
GET    /api/v1/cms/partners/
GET    /api/v1/cms/about/
GET    /api/v1/cms/about/<slug:slug>/
GET    /api/v1/cms/faqs/
POST   /api/v1/cms/contact-requests/
GET    /api/v1/cms/stats/
GET    /api/v1/cms/map-nodes/
GET    /api/v1/cms/gallery/
GET    /api/v1/cms/gallery/<uuid:pk>/
```

## Admin Endpoints (Super Admin only)

```text
GET    /api/v1/cms/admin/hero-banners/
POST   /api/v1/cms/admin/hero-banners/
GET    /api/v1/cms/admin/hero-banners/<uuid:pk>/
PATCH  /api/v1/cms/admin/hero-banners/<uuid:pk>/
DELETE /api/v1/cms/admin/hero-banners/<uuid:pk>/

GET    /api/v1/cms/admin/news/
POST   /api/v1/cms/admin/news/
GET    /api/v1/cms/admin/news/<uuid:pk>/
PATCH  /api/v1/cms/admin/news/<uuid:pk>/
DELETE /api/v1/cms/admin/news/<uuid:pk>/

GET    /api/v1/cms/admin/partners/
POST   /api/v1/cms/admin/partners/
GET    /api/v1/cms/admin/partners/<uuid:pk>/
PATCH  /api/v1/cms/admin/partners/<uuid:pk>/
DELETE /api/v1/cms/admin/partners/<uuid:pk>/

GET    /api/v1/cms/admin/about/
POST   /api/v1/cms/admin/about/
GET    /api/v1/cms/admin/about/<uuid:pk>/
PATCH  /api/v1/cms/admin/about/<uuid:pk>/
DELETE /api/v1/cms/admin/about/<uuid:pk>/

GET    /api/v1/cms/admin/faqs/
POST   /api/v1/cms/admin/faqs/
GET    /api/v1/cms/admin/faqs/<uuid:pk>/
PATCH  /api/v1/cms/admin/faqs/<uuid:pk>/
DELETE /api/v1/cms/admin/faqs/<uuid:pk>/

GET    /api/v1/cms/admin/contact-requests/
POST   /api/v1/cms/admin/contact-requests/
GET    /api/v1/cms/admin/contact-requests/<uuid:pk>/
PATCH  /api/v1/cms/admin/contact-requests/<uuid:pk>/
DELETE /api/v1/cms/admin/contact-requests/<uuid:pk>/

GET    /api/v1/cms/admin/map-nodes/
POST   /api/v1/cms/admin/map-nodes/
GET    /api/v1/cms/admin/map-nodes/<uuid:pk>/
PATCH  /api/v1/cms/admin/map-nodes/<uuid:pk>/
DELETE /api/v1/cms/admin/map-nodes/<uuid:pk>/

GET    /api/v1/cms/admin/gallery/
POST   /api/v1/cms/admin/gallery/
GET    /api/v1/cms/admin/gallery/<uuid:pk>/
PATCH  /api/v1/cms/admin/gallery/<uuid:pk>/
DELETE /api/v1/cms/admin/gallery/<uuid:pk>/
```

All admin update views use `partial=True` (PATCH semantics).

---

# 20. Business Rules

- The CMS stores content only.
- The CMS never controls website layout.
- The CMS never performs business workflows.
- Multiple hero banners are supported.
- Multiple About sections are supported.
- News and announcements share one model.
- Sponsors and partners share one model.
- Contact Requests require no authentication.
- Contact Requests have no conversation thread — follow-up is external.
- Public APIs return only active records (except Platform Stats).
- Admin API access requires Super Admin role.
- Audit logging is handled by the Shared app for most services (HeroBanner and ContactRequest excluded).
- Email notifications are not sent by the CMS (no EmailService integration).
- MapNode deletion is soft (`is_active=False`); all other models use hard delete.
- File attachments on Contact Requests are validated by the shared file validator.

---

# 21. Architecture Decision Log

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
| MapNode (Global Map) | Yes |
| Gallery | Yes |
| Platform Stats | Yes (cross-app aggregate) |
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
| Service Layer | Per-model CRUD services |
| Audit Logging | Most services (HeroBanner, ContactRequest excluded) |
| Email | Not used by CMS |
| Soft Delete | MapNode only |
| Hard Delete | All other models |
| File Validation | Shared file validator |
| Contact Request Fields Required | name, email, subject, description |
| Frontend Controls Layout | Yes |
| Admin Role | Super Admin only |

---

# 22. Final Model List

```text
cms/

HeroBanner
NewsArticle
Partner
AboutUs
ContactRequest
FAQ
MapNode
Gallery
```

---

**Status:** LOCKED
