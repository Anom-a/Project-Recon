# Project Recon - Accounts Module Design

## Authentication & Identity Specification v1.0 (LOCKED)

**Status:** Locked before database design.

### Supported Users

-   Super Admin
-   Branch Manager
-   Instructor
-   Student

### Ownership

**accounts**: Authentication, Authorization, Identity, Users, Roles,
Permissions, Branches. **academic**: Students, Enrollment, Academic
Profile, Student lifecycle.

Student accounts are created by the Academic module through Accounts
services.

### User Creation

#### Super Admin

**Management Command** - Auto email verified - Skip email verification -
Skip first-device verification - May bypass password validation - No
branch required - Immediately active

**API** - Standard registration flow - Email verification (if enabled) -
Device verification (if enabled) - Password validation - No branch
required - Branches may be assigned later

#### Branch Manager

Created via Accounts API. Branch required before login.

#### Instructor

Created via Accounts API. Branch required before login.

#### Student

Created only by Academic through Accounts services.

### Authentication

-   Email-only login
-   Unique, case-insensitive email
-   JWT Access + Refresh Tokens
-   Refresh rotation
-   Token blacklist

### Email Verification

OTP-based. - Configurable length - Configurable expiry - Limited
retries/resends - One active OTP per purpose

### Device Verification

-   Email OTP for new devices
-   Initial email verification also verifies the first device
-   Terminal-created accounts skip first-device verification
-   Email-only 2FA in v1

### Password Policy

-   Minimum 8 characters
-   Django validators
-   Management command may bypass validators

### Account Status

-   Pending
-   Active
-   Suspended
-   Locked
-   Archived

### Failed Login Protection

Configurable: - Max attempts - Lock duration - Reset on successful login

### Branch Rules

-   Super Admin does not require a branch
-   Every other user requires at least one active branch before login
-   Multiple branches supported
-   One primary branch
-   Branch assignment may occur during or after account creation
-   Authorization uses branch-based query filtering

### Parents

No independent accounts in v1.

### OTP

Single reusable OTPChallenge model: - Email Verification - Device
Verification - Password Reset

### Feature Flags

Controlled via settings.py/.env: - AUTH_REQUIRE_EMAIL_VERIFICATION -
AUTH_REQUIRE_DEVICE_VERIFICATION - AUTH_OTP_LENGTH -
AUTH_OTP_EXPIRY_MINUTES - AUTH_MAX_OTP_ATTEMPTS - AUTH_MAX_OTP_RESENDS -
AUTH_MAX_LOGIN_ATTEMPTS - AUTH_ACCOUNT_LOCK_MINUTES

## Locked Decisions

-   Email-only authentication
-   JWT
-   OTP verification
-   OTP device verification
-   Single OTP model
-   Student accounts created by Academic
-   Parents use student account
-   Super Admin exempt from branch requirement
-   Other users require branches
-   Branch authorization via query filtering
-   Management-command accounts bypass onboarding security
-   API accounts follow normal flow
-   Feature-flag-controlled verification
