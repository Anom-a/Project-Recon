# Project Recon

# Events Application

# Database Design — Part 3 (Workshop, Event Registration & Payment)

**Status:** LOCKED

**Application:** `events`

---

# 1. Entity Overview

```text
Event
│
├───────────────┐
│               │
▼               ▼
Workshop   EventRegistration
                 │
                 ▼
           EventPayment

User (instructor) → Workshop
Student (academic) → EventRegistration
```

Workshop extends Event. EventRegistration belongs to an Event. EventPayment is owned by EventRegistration.

---

# 2. Workshop

## Purpose

Represents an educational or training event. Every Workshop extends exactly one Event with event_type WORKSHOP.

---

## Database Fields

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Yes | Primary Key |
| event | OneToOne → Event | Yes | Parent Event |
| instructor | FK → User | Yes | Assigned instructor |
| duration_minutes | Integer | Yes | Duration in minutes |
| level | Choice | Yes | Beginner / Intermediate / Advanced |
| price | Decimal(10,2) | No | Informational workshop price |
| created_at | DateTime | Yes | Audit |
| updated_at | DateTime | Yes | Audit |

## Workshop Level

```
BEGINNER
INTERMEDIATE
ADVANCED
```

## Constraints

- Must belong to exactly one Event.
- Cannot exist without an Event.
- Must have one assigned instructor.
- Uses the registration configuration defined by its parent Event.

---

# 3. Event Registration

## Purpose

Represents one registration for an Event. Shared by Tournaments, Workshops, and future Event Types.

## Registration Types

### Student Registration

Used for authenticated students. Linked through the Academic Student model.

### Public Registration

Used for users without an account. Contact information is stored directly.

---

## Database Fields

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Yes | Primary Key |
| event | FK → Event | Yes | Parent Event (CASCADE) |
| student | FK → Student | No | Required for student registrations |
| public_full_name | String(255) | No | Public participant name |
| public_email | Email | No | Public participant email |
| public_phone | String(50) | No | Public participant phone |
| public_organization | String(255) | No | School, Company or Club |
| registration_status | Choice | Yes | PENDING / APPROVED / REJECTED / CANCELLED |
| payment_status | Choice | Yes | PENDING_VERIFICATION / VERIFIED / REJECTED / CANCELLED |
| registered_at | DateTime | Yes | Registration timestamp |
| approved_at | DateTime | No | Approval timestamp |
| cancelled_at | DateTime | No | Cancellation timestamp |
| created_at | DateTime | Yes | Audit |
| updated_at | DateTime | Yes | Audit |

## Registration Status

```
PENDING
APPROVED
REJECTED
CANCELLED
```

## Payment Status

```
PENDING_VERIFICATION
VERIFIED
REJECTED
CANCELLED
```

## Constraints

- Must belong to one Event.
- Must satisfy the Event registration rules (mode, deadline, capacity).
- Only one active registration per participant for the same Event.
- Student registration: unique (event, student).
- Public registration: unique (event, public_email).
- Exactly one registration type must be used (student XOR public).

## Registration Rules

When Registration Mode is STUDENT or SUBPROGRAM_STUDENT:
- student is required.
- public_full_name, public_email, public_phone, public_organization must be NULL.

When Registration Mode is PUBLIC:
- student must be NULL.
- public_full_name and public_email are required.
- public_phone is required.
- public_organization is optional.

---

# 4. EventPayment

## Purpose

Owns all payment data for event registrations. Supports cash, bank transfer, and mobile money with a verification workflow.

---

## Database Fields

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Yes | Primary Key |
| registration | OneToOne → EventRegistration | Yes | Parent registration |
| amount | Decimal(10,2) | Yes | Paid amount |
| payment_method | Choice | Yes | Cash / Bank Transfer / Mobile Money / Cheque |
| transaction_reference | String(255) | No | External reference |
| bank_name | String(255) | No | Bank name for transfers |
| attachment | File | No | Payment proof upload |
| payment_date | DateTime | No | Payment completion |
| status | Choice | Yes | Payment status |
| verified_by | FK → User | No | Staff who verified |
| verified_at | DateTime | No | When verified |
| verification_notes | Text | No | Admin notes |
| created_at | DateTime | Yes | Audit |
| updated_at | DateTime | Yes | Audit |

## Payment Method

```
CASH
BANK_TRANSFER
MOBILE_MONEY
CHEQUE
```

## Payment Status

```
PENDING_VERIFICATION
VERIFIED
REJECTED
CANCELLED
```

## Constraints

- Every Registration owns one Payment.
- Payment amount must be greater than zero.
- Non-cash payments require transaction_reference or attachment.
- Cash payments are automatically verified upon recording.

## Payment Workflow

```text
Cash Payment:
  Staff records cash → EventPayment created (VERIFIED)
  → Registration auto-approved

Non-Cash Payment:
  User submits evidence → EventPayment created (PENDING_VERIFICATION)
  → Staff verifies (VERIFIED) or rejects (REJECTED)
  → On VERIFIED: Registration auto-approved
  → On REJECTED: Registration auto-rejected
```

---

# 5. Capacity Rules

If capacity is NULL, unlimited registrations are allowed. Otherwise, approved registrations must never exceed the configured capacity. Capacity enforcement is performed by the service layer.

---

# 6. Delete Rules

Deleting an Event (CASCADE) deletes Event Registrations. Deleting an Event Registration (CASCADE) deletes its EventPayment. Payment history is preserved as long as the registration exists.

Deleting an Event does not delete Workshop or Tournament (PROTECT).

---

# 7. Index Recommendations

## Workshop

- instructor

## EventRegistration

- event, student, registration_status, payment_status, registered_at
- (event, registration_status), (event, payment_status)
- (event, public_email), (event, student)

## EventPayment

- registration, status, payment_method, payment_date, transaction_reference

---

# 8. Business Rules

- Workshop extends Event.
- Event Registration belongs to Event.
- One Registration model supports every Event type.
- Student information is never duplicated inside Event Registration.
- Public participant information exists only for public registrations.
- Every registration is either a Student Registration or a Public Registration, never both.
- EventPayment is owned by the Events application (not shared).
- Cash payments are recorded by staff and auto-verified.
- Non-cash payments require a verification workflow.
- Capacity validation is handled by the service layer.
- Registration eligibility is determined by the parent Event configuration.

---

# 9. Locked Decisions

- Workshop extends Event.
- Event Registration is shared across all Event types.
- Public and authenticated users share the same registration model.
- Student registrations reference Academic Student.
- Public registrations store their own contact information.
- EventPayment is part of the Events application (not a shared service).
- Payment statuses: PENDING_VERIFICATION, VERIFIED, REJECTED, CANCELLED.
- Cash payments are verified immediately upon recording.
- Capacity validation is performed by the service layer.
- Registration eligibility is determined by the parent Event configuration.

---

**Status:** LOCKED
