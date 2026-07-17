# Project Recon

# Accounts Module

# UserAssignment Model Specification v1.0 (LOCKED)

**Status:** LOCKED

------------------------------------------------------------------------

# 1. Purpose

The UserAssignment model defines a user's role within a specific branch.

It is the authorization bridge between Users and Branches.

This model replaces both:

-   UserRole
-   UserBranch

A user may have multiple assignments across different branches.

------------------------------------------------------------------------

# 2. Ownership

  Property      Value
  ------------- --------------------------
  Module        accounts
  Table         accounts_user_assignment
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

------------------------------------------------------------------------

# 4. Field Specification

## id

-   UUIDField
-   Primary Key

------------------------------------------------------------------------

## user

-   ForeignKey(User)
-   Required
-   on_delete=CASCADE
-   related_name="assignments"
-   Indexed

------------------------------------------------------------------------

## branch

-   ForeignKey(Branch)
-   Nullable only for Super Admin
-   on_delete=PROTECT
-   related_name="assignments"
-   Indexed

------------------------------------------------------------------------

## role

CharField

Choices:

-   SUPER_ADMIN
-   BRANCH_MANAGER
-   SECRETARY
-   INSTRUCTOR
-   STUDENT

Stored using `Roles.CHOICES`.

Indexed.

------------------------------------------------------------------------

## is_primary

BooleanField

Default:

False

Represents the user's default branch context.

------------------------------------------------------------------------

## is_active

BooleanField

Default:

True

Inactive assignments are ignored by authorization.

------------------------------------------------------------------------

## assigned_by

ForeignKey(User)

Nullable

on_delete=SET_NULL

related_name="created_assignments"

Represents the administrator who created the assignment.

------------------------------------------------------------------------

## created_at

DateTimeField(auto_now_add=True)

Indexed.

------------------------------------------------------------------------

## updated_at

DateTimeField(auto_now=True)

------------------------------------------------------------------------

# 5. Relationships

User

→ UserAssignment

One-to-Many

Branch

→ UserAssignment

One-to-Many

Assigned By

→ User

Many-to-One

------------------------------------------------------------------------

# 6. Database Constraints

## Unique Constraint

(user, branch, role)

Prevents duplicate assignments.

------------------------------------------------------------------------

## Conditional Unique Constraint

One primary assignment per user.

Condition:

is_primary=True

------------------------------------------------------------------------

## Check Constraint

If role == SUPER_ADMIN

branch MUST be NULL.

Otherwise

branch MUST NOT be NULL.

------------------------------------------------------------------------

# 7. Database Indexes

Primary Key

-   id

Indexes

-   user
-   branch
-   role
-   is_active
-   created_at

Composite Index

(branch, role)

Optimizes manager lookups.

------------------------------------------------------------------------

# 8. Business Rules

-   A user may have multiple assignments.
-   A user may have different roles in different branches.
-   Only one assignment may be primary.
-   Only one active Branch Manager may exist per branch.
-   Super Admin assignments never belong to a branch.
-   Archived branches cannot receive new assignments.
-   Inactive assignments grant no permissions.

------------------------------------------------------------------------

# 9. Validation Rules

-   Duplicate assignments are forbidden.
-   Primary assignment must also be active.
-   Branch Manager role is unique per branch.
-   Super Admin cannot have a branch.
-   Non-Super Admin must have a branch.

------------------------------------------------------------------------

# 10. Service Ownership

Writes only through:

-   AssignmentService
-   UserService (during user creation)
-   BranchService (manager workflows)

Views never modify assignments directly.

------------------------------------------------------------------------

# 11. Query Patterns

Frequently executed queries:

-   User assignments
-   Branch staff
-   Branch manager lookup
-   User permissions
-   Primary assignment lookup

Indexes support these operations.

------------------------------------------------------------------------

# 12. Future Extensions

-   Assignment start date
-   Assignment end date
-   Acting manager flag
-   Assignment notes
-   Temporary assignments

------------------------------------------------------------------------

# 13. Implementation Notes

-   No Role table.
-   No UserRole table.
-   No UserBranch table.
-   Roles are application constants.
-   Branch permissions derive entirely from active assignments.
-   Manager replacement must occur inside a transaction.

------------------------------------------------------------------------

# Status

**LOCKED**

This specification is the implementation contract for the UserAssignment
model.
