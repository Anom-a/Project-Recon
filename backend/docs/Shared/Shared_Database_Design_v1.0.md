# Project Recon

# Shared Database Design v1.0

**Status:** LOCKED BEFORE IMPLEMENTATION

**App:** `shared`

---

# 1. Database Philosophy

Unlike business apps, the Shared app is service-oriented rather than data-oriented.

Most functionality is implemented through services instead of database models.

Shared should therefore contain as few database tables as possible.

---

# 2. Database Overview

Shared contains a single database table.

```text
shared
└── AuditLog
```

Email and Payment communicate directly with external providers and require no database tables.

---

# 3. Entity Relationship Diagram

```text
                    +------------------+
                    |      User        |
                    +------------------+
                             ▲
                             │ actor (FK)
                             │
                     +------------------+
                     |    AuditLog      |
                     +------------------+
                             │
                             │ branch (FK)
                             ▼
                    +------------------+
                    |     Branch       |
                    +------------------+
```

AuditLog references Accounts using string model references (`settings.AUTH_USER_MODEL` and `"accounts.Branch"`), avoiding circular imports.

---

# 4. AuditLog

Purpose: Maintain a permanent audit trail of important system actions.

## Fields

### id

- UUID
- Primary Key

### actor

- ForeignKey → User
- Nullable
- Stores the authenticated user that performed the action.

### action

- CharField
- Uses Django TextChoices

Example values:

- CREATE
- UPDATE
- DELETE
- LOGIN
- LOGOUT
- VERIFY_EMAIL
- CHANGE_PASSWORD
- RESET_PASSWORD
- ASSIGN_ROLE
- REMOVE_ROLE
- ACTIVATE
- DEACTIVATE

### resource_type

- CharField
- Stores the affected business entity name.

Examples:

- User
- Branch
- Student
- Product
- Order
- Event
- Attendance

### resource_id

- UUIDField
- Stores the UUID of the affected resource.

### branch

- ForeignKey → Branch
- Nullable
- Stores the branch associated with the action.

### ip_address

- GenericIPAddressField
- Nullable

### user_agent

- TextField
- Nullable

### created_at

- DateTimeField
- Automatically generated.

---

# 5. Relationships

- User (1) → (Many) AuditLog
- Branch (1) → (Many) AuditLog

No other foreign keys exist.

---

# 6. Referential Behavior

User deletion:

- on_delete=SET_NULL

Branch deletion:

- on_delete=SET_NULL

Audit history must always remain intact.

---

# 7. Recommended Indexes

- created_at
- actor
- branch
- action
- resource_type
- resource_id

---

# 8. Constraints

Audit records are immutable.

- Never updated
- Never deleted

Only inserts are allowed through AuditService.

---

# 9. Shared Does NOT Store

- Email messages
- Email queue
- Payment transactions
- Payment history
- OTPs
- Sessions
- Authentication state

---

# 10. Future Expansion

Possible future infrastructure tables:

- SMSLog
- WebhookLog
- NotificationLog

Only when required.

---

# 11. Database Decision Log

| Decision | Choice |
|----------|--------|
| Number of Tables | 1 |
| Table | AuditLog |
| Primary Key | UUID |
| Actor | FK → User |
| Branch | FK → Branch |
| Resource Reference | resource_type + resource_id |
| User Deletion | SET_NULL |
| Branch Deletion | SET_NULL |
| Audit Updates | Never |
| Audit Deletes | Never |
| Payment Tables | None |
| Email Tables | None |
| OTP Tables | None |

---

# 12. Database Summary

```text
shared
└── AuditLog
    ├── id
    ├── actor
    ├── action
    ├── resource_type
    ├── resource_id
    ├── branch
    ├── ip_address
    ├── user_agent
    └── created_at
```

---

**Status:** LOCKED
