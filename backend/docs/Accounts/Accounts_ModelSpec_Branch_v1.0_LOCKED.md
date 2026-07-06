# Project Recon

# Accounts Module

# Branch Model Specification v1.0 (LOCKED)

**Status:** LOCKED

## 1. Purpose

The Branch model represents an organizational branch.

It owns:

-   Branch identity
-   Contact information
-   Operational status

It does not own:

-   Managers
-   Staff
-   Students
-   Roles

Those are represented through UserAssignment.

------------------------------------------------------------------------

## 2. Ownership

  Property      Value
  ------------- -----------------
  Module        accounts
  Table         accounts_branch
  Primary Key   UUID

------------------------------------------------------------------------

## 3. Primary Key

``` python
id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
```

------------------------------------------------------------------------

## 4. Field Specification

### id

-   UUIDField
-   Primary Key

### name

-   CharField(max_length=150)
-   Required
-   Unique
-   Indexed

### code

-   CharField(max_length=20)
-   Required
-   Unique
-   Indexed

Examples: - ADD - HAW - B01

### email

-   EmailField
-   Optional

### phone_number

-   CharField(max_length=20)
-   Optional

### address

-   TextField
-   Optional

### city

-   CharField(max_length=100)
-   Optional
-   Indexed

### state_region

-   CharField(max_length=100)
-   Optional

### country

-   CharField(max_length=100)
-   Default: Ethiopia

### status

Choices:

-   Active
-   Inactive
-   Archived

Default: Active

Indexed.

### created_at

DateTimeField(auto_now_add=True)

Indexed.

### updated_at

DateTimeField(auto_now=True)

------------------------------------------------------------------------

## 5. Relationships

Branch

→ UserAssignment (One-to-Many)

No direct relation to User.

------------------------------------------------------------------------

## 6. Constraints

-   name unique
-   code unique
-   status valid choice

------------------------------------------------------------------------

## 7. Database Indexes

Primary Key - id

Unique - name - code

Indexes - city - status - created_at

------------------------------------------------------------------------

## 8. Business Rules

-   A branch may have many users.
-   A branch may have many instructors.
-   A branch may have many students.
-   A branch may have exactly one active Branch Manager.
-   Branch membership is managed only through UserAssignment.
-   Archived branches cannot receive new assignments.

------------------------------------------------------------------------

## 9. Validation Rules

-   Name cannot be empty.
-   Code stored uppercase.
-   Code immutable after creation unless Super Admin changes it.
-   Archived branches cannot be activated without explicit admin action.

------------------------------------------------------------------------

## 10. Service Ownership

Writes only through:

-   BranchService
-   AssignmentService (assignment relationships only)

Views never modify Branch directly.

------------------------------------------------------------------------

## 11. Query Patterns

Common queries:

-   List active branches
-   Search by name
-   Lookup by code
-   Branch directory

Indexes are designed accordingly.

------------------------------------------------------------------------

## 12. Future Extensions

-   GPS coordinates
-   Working hours
-   Branch logo
-   Tax information
-   Capacity
-   Regional grouping

------------------------------------------------------------------------

## 13. Implementation Notes

-   UUID primary key
-   No manager_id field
-   Branch manager determined through UserAssignment
-   No soft delete field; archived status represents retirement

------------------------------------------------------------------------

# Status

**LOCKED**

This specification is the implementation contract for the Branch model.
