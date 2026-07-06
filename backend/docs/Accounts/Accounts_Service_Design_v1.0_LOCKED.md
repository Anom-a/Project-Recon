# Project Recon

# Accounts Module Service Design v1.0 (LOCKED)

**Status:** Locked before implementation.

## Service Principles

-   Business logic lives in services.
-   Views only authenticate, validate, call services, and return
    responses.
-   Services may call other services.
-   Services never import DRF.
-   Multi-step write operations use `transaction.atomic()`.
-   Services raise domain exceptions.
-   Important business events are recorded through `AuditService`.

------------------------------------------------------------------------

# 1. AuthenticationService

Responsible for the authentication lifecycle.

## Public Methods

-   login(email, password, device_info)
-   logout(user, refresh_token)
-   refresh_token(refresh_token)
-   request_email_verification(user)
-   verify_email_otp(user, otp)
-   request_device_verification(user, device_info)
-   verify_device_otp(user, otp, device_info)
-   forgot_password(email)
-   reset_password(otp, new_password)
-   change_password(user, old_password, new_password)

## Rules

-   Uses OTPService for OTP generation/verification.
-   Uses DeviceService for trusted devices.
-   Uses LoginSecurityService for lockout protection.
-   Uses AuditService for auditing.

------------------------------------------------------------------------

# 2. UserService

Responsible for user lifecycle.

## Public Methods

-   create_super_admin()
-   create_staff_user()
-   create_branch_manager()
-   create_student_user()
-   update_user()
-   activate_user()
-   deactivate_user()
-   archive_user()
-   change_email()
-   get_user()
-   list_users()
-   search_users()

## Rules

-   API-created Super Admins follow the normal authentication flow.
-   Terminal-created Super Admins bypass configured onboarding checks.
-   Students are created only by the Academic module through this
    service.
-   Branch Manager creation automatically creates the required branch
    assignment.
-   All creation workflows are transactional.

------------------------------------------------------------------------

# 3. AssignmentService

Responsible for branch-role assignments.

## Public Methods

-   assign_role()
-   remove_assignment()
-   update_assignment()
-   change_primary_assignment()
-   transfer_user()
-   list_assignments()

## Rules

-   User + Branch + Role is the assignment.
-   Duplicate (user, branch, role) assignments are forbidden.
-   Only one primary assignment per user.
-   Super Admin assignment must have NULL branch.
-   Non-Super Admin assignments must have a branch.
-   A branch may have only ONE active Branch Manager.

------------------------------------------------------------------------

# 4. BranchService

Responsible for branch management.

## Public Methods

-   create_branch()
-   create_branch_with_manager()
-   assign_branch_manager()
-   change_branch_manager()
-   update_branch()
-   activate_branch()
-   deactivate_branch()
-   archive_branch()
-   get_branch()
-   list_branches()

## Rules

-   Each branch can have only one active Branch Manager.
-   Changing managers is transactional:
    1.  Remove/deactivate current manager assignment.
    2.  Create new manager assignment.
    3.  Audit the change.

------------------------------------------------------------------------

# 5. OTPService

## Public Methods

-   generate()
-   send()
-   verify()
-   invalidate()
-   cleanup_expired()

Supports: - Email Verification - Device Verification - Password Reset

------------------------------------------------------------------------

# 6. DeviceService

## Public Methods

-   register_device()
-   verify_device()
-   list_devices()
-   remove_device()
-   remove_all_devices_except_current()

------------------------------------------------------------------------

# 7. LoginSecurityService

## Public Methods

-   record_success()
-   record_failure()
-   reset_attempts()
-   lock_account_if_needed()
-   is_locked()

------------------------------------------------------------------------

# 8. AuditService (Shared)

Shared infrastructure service.

## Public Methods

-   log()
-   log_create()
-   log_update()
-   log_delete()
-   log_login()
-   log_logout()

Used by every module.

------------------------------------------------------------------------

# Service Dependencies

AuthenticationService - UserService - OTPService - DeviceService -
LoginSecurityService - AuditService

UserService - AssignmentService - AuditService

BranchService - UserService - AssignmentService - AuditService

AssignmentService - AuditService

------------------------------------------------------------------------

# Locked Rules

-   Business logic exists only in services.
-   Services communicate with other modules through public services.
-   No business logic in models or views.
-   Branch Manager is a specialized user creation workflow.
-   Branch creation may include manager creation.
-   Each branch has exactly one active Branch Manager.
-   Manager replacement is a dedicated transactional workflow.
-   OTP generation is centralized in OTPService.
-   Authentication delegates specialized work to dedicated services.

**Status:** LOCKED
