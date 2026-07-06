# Project Recon

# Accounts Module Database Design v1.0 (LOCKED)

**Status:** Locked before service design.

## Design Principles

-   Keep the schema simple.
-   Avoid unnecessary tables.
-   Business logic belongs in services.
-   Roles are application constants, not database entities.
-   Authorization is enforced in views/services.
-   Branch access is enforced through query filtering.

------------------------------------------------------------------------

# Database Tables

## 1. User

Purpose: - Identity - Authentication - User information

Owns: - Email - Password - Personal information - Account status

No separate Profile table.

------------------------------------------------------------------------

## 2. Branch

Represents an organizational branch.

Owns: - Branch information - Status - Contact information

------------------------------------------------------------------------

## 3. UserAssignment

Represents a user's role within a branch.

Replaces: - UserRole - UserBranch

Fields:

-   id
-   user_id
-   branch_id (nullable only for Super Admin)
-   role (CharField using Roles.CHOICES)
-   is_primary
-   is_active
-   assigned_by
-   created_at
-   updated_at

### Business Rules

-   A user may belong to many branches.
-   A user may have different roles in different branches.
-   A user may have multiple assignments.
-   Only one assignment may be primary.
-   Super Admin has a NULL branch.
-   All other roles require a branch.
-   Duplicate (user, branch, role) assignments are not allowed.

Examples:

  User    Branch    Role
  ------- --------- ----------------
  John    Addis     Instructor
  John    Hawassa   Branch Manager
  John    Adama     Instructor
  Alice   NULL      Super Admin

------------------------------------------------------------------------

## 4. OTPChallenge

Single reusable OTP model.

Purposes:

-   Email Verification
-   Device Verification
-   Password Reset

Rules:

-   One active OTP per purpose.
-   Configurable expiry.
-   Configurable resend limit.
-   Configurable verification attempts.

------------------------------------------------------------------------

## 5. TrustedDevice

Stores verified devices.

Purpose:

-   Skip email OTP on known devices.
-   Trigger device verification only for new devices.

------------------------------------------------------------------------

## 6. LoginAttempt

Tracks authentication events.

Examples:

-   Successful login
-   Failed login
-   Account locked

Used for lockout protection.

------------------------------------------------------------------------

# Shared Infrastructure

## AuditLog

This model belongs in the shared module, not accounts.

Purpose:

-   Audit business events across the platform.

Examples:

-   User created
-   Branch assigned
-   Password changed
-   Student registered
-   Event created
-   Order created

All modules write through a shared AuditService.

------------------------------------------------------------------------

# Role Design

Roles are defined in Python constants.

Example roles:

-   SUPER_ADMIN
-   BRANCH_MANAGER
-   INSTRUCTOR
-   STUDENT

Adding a new role only requires updating the constants class. No
database migration is required.

------------------------------------------------------------------------

# Removed Tables

The following tables are intentionally omitted:

-   Profile
-   Role
-   Permission
-   RolePermission
-   UserRole
-   UserBranch
-   EmailVerification
-   PasswordReset

Their responsibilities are handled through: - UserAssignment -
OTPChallenge - Role constants - DRF permissions - Services

------------------------------------------------------------------------

# Locked Decisions

-   One User model.
-   No Profile table.
-   Role constants in code.
-   No Role table.
-   No Permission table.
-   No RolePermission table.
-   UserAssignment replaces UserRole and UserBranch.
-   One reusable OTPChallenge model.
-   TrustedDevice for remembered devices.
-   LoginAttempt for authentication security.
-   AuditLog belongs to shared infrastructure.
-   Branch authorization uses query filtering.
-   Multiple roles and branches are fully supported.

**Status:** LOCKED
