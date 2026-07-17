# Project Recon

# Accounts Module

# User Model Specification v1.0 (LOCKED)

**Status:** LOCKED

------------------------------------------------------------------------

# 1. Purpose

The **User** model is the core identity model of Project Recon.

It owns:

-   Authentication
-   Identity
-   Personal information
-   Account lifecycle
-   Email verification state
-   Authentication status

It does **not** own:

-   Student information
-   Branch assignments
-   Roles
-   OTPs
-   Trusted devices

Those are handled by their respective models.

------------------------------------------------------------------------

# 2. Ownership

  Property      Value
  ------------- ---------------
  Module        accounts
  Table         accounts_user
  Primary Key   UUID

------------------------------------------------------------------------

# 3. Primary Key

``` python
id = models.UUIDField(
    primary_key=True,
    default=uuid.uuid4,
    editable=False,
)
```

Reasons:

-   Public-safe identifiers
-   Better API security
-   Easier future scaling

------------------------------------------------------------------------

# 4. Field Specification

## id

-   UUIDField
-   Primary Key
-   Required
-   Auto generated
-   Non-editable

------------------------------------------------------------------------

## email

-   EmailField
-   Required
-   Unique
-   Indexed

Rules:

-   Trim whitespace
-   Convert to lowercase before saving
-   Case-insensitive uniqueness

------------------------------------------------------------------------

## password

Inherited from `AbstractBaseUser`.

Never exposed through serializers.

------------------------------------------------------------------------

## first_name

-   CharField
-   max_length=100
-   Required

------------------------------------------------------------------------

## last_name

-   CharField
-   max_length=100
-   Required

------------------------------------------------------------------------

## phone_number

-   CharField
-   max_length=20
-   Nullable
-   Blank allowed
-   Unique when provided

Reserved for future SMS support.

------------------------------------------------------------------------

## profile_picture

-   ImageField
-   Optional
-   Uses configured storage provider

------------------------------------------------------------------------

## date_of_birth

-   DateField
-   Optional

------------------------------------------------------------------------

## gender

-   CharField

Choices:

-   Male
-   Female
-   Prefer not to say

Optional.

------------------------------------------------------------------------

## status

CharField

Choices:

-   Pending
-   Active
-   Suspended
-   Archived

Default:

Pending

Indexed.

------------------------------------------------------------------------

## is_email_verified

BooleanField

Default:

False

Management-command users:

Automatically True.

Indexed.

------------------------------------------------------------------------

## last_login

Inherited from Django.

------------------------------------------------------------------------

## created_at

DateTimeField

-   auto_now_add=True
-   Indexed

------------------------------------------------------------------------

## updated_at

DateTimeField

-   auto_now=True

------------------------------------------------------------------------

## is_staff

-   BooleanField
-   Default: False

------------------------------------------------------------------------

# 5. Relationships

User

→ UserAssignment (One-to-Many)

→ OTPChallenge (One-to-Many)

→ TrustedDevice (One-to-Many)

AuditLog references User as the actor.

------------------------------------------------------------------------

# 6. Database Constraints

-   Email must be unique.
-   Phone number must be unique when present.
-   Email stored lowercase.
-   Status must be a valid choice.

------------------------------------------------------------------------

# 7. Database Indexes

Primary Key

-   id

Unique Indexes

-   email
-   phone_number

Indexes

-   status
-   is_email_verified
-   created_at

------------------------------------------------------------------------

# 8. Model Properties

## full_name

Returns:

First Last

------------------------------------------------------------------------

## initials

Returns:

JD

------------------------------------------------------------------------

## is_active_account

Returns True only when status is Active.

------------------------------------------------------------------------

# 9. Business Rules

-   User may exist without assignments.
-   Only Super Admin may log in without a branch assignment.
-   Student accounts are created only through Academic services.
-   Management-command users:
    -   Skip onboarding
    -   Auto verify email
    -   Skip first-device verification
-   Email verification is configurable.
-   Device verification is configurable.

------------------------------------------------------------------------

# 10. Validation Rules

-   Normalize email.
-   Normalize phone number.
-   First name required.
-   Last name required.
-   Archived accounts cannot log in.
-   Suspended accounts cannot log in.
-   Locked accounts cannot log in.
-   Pending accounts require email verification when enabled.

------------------------------------------------------------------------

# 11. Service Ownership

Only:

-   UserService
-   AuthenticationService

may modify this model.

Views never modify User directly.

------------------------------------------------------------------------

# 12. Query Patterns

Frequently executed queries:

-   Login by email
-   User lookup
-   Active users
-   User search
-   Staff listing

Indexes support these operations.

------------------------------------------------------------------------

# 13. Future Extensions

-   Preferred language
-   Time zone
-   Notification preferences
-   Avatar providers
-   External authentication

------------------------------------------------------------------------

# 14. Implementation Notes

Subclass:

-   AbstractBaseUser
-   PermissionsMixin

Use:

-   Custom UserManager

Configuration:

-   USERNAME_FIELD = "email"

No:

-   username field
-   profile model
-   role field
-   branch field

Branches and roles are managed by UserAssignment.

------------------------------------------------------------------------

# Status

**LOCKED**

This specification is the implementation contract for the User model.
