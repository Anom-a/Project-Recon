# Project Recon

# Accounts Module

# OTPChallenge Model Specification v1.0 (LOCKED)

**Status:** LOCKED

## 1. Purpose

OTPChallenge stores every one-time password challenge used by the
authentication system.

Supported purposes:

-   Email Verification
-   Device Verification
-   Password Reset

A single reusable model supports all current and future OTP workflows.

------------------------------------------------------------------------

## 2. Ownership

  Property      Value
  ------------- ------------------------
  Module        accounts
  Table         accounts_otp_challenge
  Primary Key   UUID

------------------------------------------------------------------------

## 3. Field Specification

### id

-   UUIDField
-   Primary Key

### user

-   ForeignKey(User)
-   Required
-   on_delete=CASCADE
-   related_name="otp_challenges"

### purpose

CharField

Choices:

-   EMAIL_VERIFICATION
-   DEVICE_VERIFICATION
-   PASSWORD_RESET

Indexed.

### otp_code

CharField(max_length=128)

Stores the generated OTP.

Never returned by APIs.

### expires_at

DateTimeField

Required.

Indexed.

### attempts

PositiveSmallIntegerField

Default: 0

### resend_count

PositiveSmallIntegerField

Default: 0

### is_used

BooleanField

Default: False

Indexed.

### metadata

JSONField

Optional.

Stores context such as device fingerprint or email.

### created_at

DateTimeField(auto_now_add=True)

Indexed.

### updated_at

DateTimeField(auto_now=True)

------------------------------------------------------------------------

## 4. Relationships

User

→ OTPChallenge

One-to-Many

------------------------------------------------------------------------

## 5. Constraints

-   Only one active OTP per (user, purpose).
-   Used OTPs cannot be reused.
-   Expired OTPs are invalid.

------------------------------------------------------------------------

## 6. Database Indexes

Primary Key

-   id

Indexes

-   user
-   purpose
-   expires_at
-   is_used
-   created_at

Composite

-   (user, purpose, is_used)

------------------------------------------------------------------------

## 7. Business Rules

-   OTP length configurable via settings.
-   OTP expiry configurable.
-   Maximum attempts configurable.
-   Maximum resend count configurable.
-   Successful verification invalidates OTP.
-   New OTP invalidates previous active OTP of the same purpose.

------------------------------------------------------------------------

## 8. Validation Rules

-   Reject expired OTP.
-   Reject used OTP.
-   Reject OTP after maximum attempts.
-   Reject resend after configured limit.

------------------------------------------------------------------------

## 9. Service Ownership

Only OTPService may:

-   Generate
-   Verify
-   Invalidate
-   Cleanup

AuthenticationService consumes OTPService.

------------------------------------------------------------------------

## 10. Query Patterns

-   Active OTP by user/purpose
-   Expired OTP cleanup
-   Verify OTP

Indexes support these operations.

------------------------------------------------------------------------

## 11. Future Extensions

-   SMS OTP
-   Voice OTP
-   Authenticator app migration
-   Rate limiting metadata

------------------------------------------------------------------------

## 12. Implementation Notes

-   Store OTP hashed (recommended), never plaintext.
-   Cleanup handled by scheduled task.
-   Model reused for all OTP purposes.

------------------------------------------------------------------------

# Status

**LOCKED**

Implementation contract for OTPChallenge.
