# Project Recon

# Accounts Module

# LoginAttempt Model Specification v1.0 (LOCKED)

**Status:** LOCKED

## 1. Purpose

The LoginAttempt model records every authentication attempt for
auditing, security monitoring, and account lockout.

It supports:

-   Successful logins
-   Failed logins
-   Account lockout
-   Security analytics
-   Future anomaly detection

------------------------------------------------------------------------

## 2. Ownership

  Property      Value
  ------------- ------------------------
  Module        accounts
  Table         accounts_login_attempt
  Primary Key   UUID

------------------------------------------------------------------------

## 3. Field Specification

### id

-   UUIDField
-   Primary Key

### user

-   ForeignKey(User)
-   Nullable
-   on_delete=SET_NULL
-   related_name="login_attempts"
-   Indexed

Allows logging attempts even when no valid user is identified.

### email

-   EmailField
-   Required
-   Indexed

Stores the submitted email address.

### status

Choices:

-   SUCCESS
-   FAILED
-   LOCKED

Indexed.

### failure_reason

Optional CharField(max_length=100)

Examples:

-   INVALID_PASSWORD
-   USER_NOT_FOUND
-   ACCOUNT_LOCKED
-   EMAIL_NOT_VERIFIED
-   DEVICE_NOT_VERIFIED

### ip_address

GenericIPAddressField

Optional.

### user_agent

TextField

Optional.

### device_fingerprint

CharField(max_length=255)

Optional.

### attempted_at

DateTimeField(auto_now_add=True)

Indexed.

------------------------------------------------------------------------

## 4. Relationships

User → LoginAttempt (One-to-Many)

------------------------------------------------------------------------

## 5. Constraints

-   Status must be a valid choice.
-   Email is always stored lowercase.

------------------------------------------------------------------------

## 6. Database Indexes

Primary Key

-   id

Indexes

-   user
-   email
-   status
-   attempted_at

Composite

-   (email, attempted_at)
-   (user, attempted_at)

------------------------------------------------------------------------

## 7. Business Rules

-   Every login attempt is recorded.
-   Failed attempts contribute to account lockout.
-   Successful login resets failure counters.
-   Records are immutable after creation.
-   Audit retention period is configurable.

------------------------------------------------------------------------

## 8. Validation Rules

-   Normalize email.
-   Store timestamps in UTC.
-   Do not modify existing records.

------------------------------------------------------------------------

## 9. Service Ownership

Only LoginSecurityService creates LoginAttempt records.

AuthenticationService consumes LoginSecurityService.

------------------------------------------------------------------------

## 10. Query Patterns

Common queries:

-   Recent login history
-   Failed login analysis
-   Lockout evaluation
-   Security investigations

------------------------------------------------------------------------

## 11. Future Extensions

-   Geo-location lookup
-   Risk score
-   ASN information
-   Browser parsing
-   MFA method used

------------------------------------------------------------------------

## 12. Implementation Notes

-   Append-only model.
-   Never update existing rows except through data migrations.
-   Suitable for long-term auditing and reporting.

------------------------------------------------------------------------

# Status

**LOCKED**

Implementation contract for LoginAttempt.
