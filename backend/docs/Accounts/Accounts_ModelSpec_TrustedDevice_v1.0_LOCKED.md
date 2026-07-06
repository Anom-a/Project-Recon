# Project Recon

# Accounts Module

# TrustedDevice Model Specification v1.0 (LOCKED)

**Status:** LOCKED

## 1. Purpose

TrustedDevice stores devices that have successfully completed device
verification.

It enables trusted-device recognition and reduces repeated OTP
challenges.

------------------------------------------------------------------------

## 2. Ownership

  Property      Value
  ------------- -------------------------
  Module        accounts
  Table         accounts_trusted_device
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
-   related_name="trusted_devices"
-   Indexed

### device_id

-   CharField(max_length=255)
-   Required
-   Indexed

### device_name

-   CharField(max_length=255)
-   Optional

### device_type

Choices: - Desktop - Laptop - Mobile - Tablet - Other

### fingerprint

-   CharField(max_length=255)
-   Required
-   Indexed

### ip_address

-   GenericIPAddressField
-   Optional

### last_used_at

-   DateTimeField
-   Indexed

### expires_at

-   DateTimeField
-   Optional

### is_active

-   BooleanField(default=True)
-   Indexed

### created_at

-   DateTimeField(auto_now_add=True)
-   Indexed

### updated_at

-   DateTimeField(auto_now=True)

------------------------------------------------------------------------

## Relationships

User → TrustedDevice (One-to-Many)

------------------------------------------------------------------------

## Constraints

-   (user, fingerprint) must be unique.
-   Inactive devices are ignored.
-   Expired devices require re-verification.

------------------------------------------------------------------------

## Indexes

-   user
-   fingerprint
-   is_active
-   last_used_at
-   created_at

Composite: - (user, is_active)

------------------------------------------------------------------------

## Business Rules

-   New devices require OTP when enabled.
-   Verified devices bypass device OTP.
-   Email verification satisfies first device verification.
-   Terminal-created users bypass trusted device flow.
-   Users may revoke devices at any time.

------------------------------------------------------------------------

## Validation Rules

-   Fingerprint required.
-   Device must belong to one user.
-   Expired devices cannot authenticate.

------------------------------------------------------------------------

## Service Ownership

Only DeviceService may create, verify, update or remove trusted devices.

------------------------------------------------------------------------

## Query Patterns

-   Lookup trusted device
-   User device list
-   Cleanup expired devices

------------------------------------------------------------------------

## Future Extensions

-   Browser metadata
-   Operating system
-   Location history
-   Risk scoring

------------------------------------------------------------------------

## Implementation Notes

-   Fingerprints should be generated securely.
-   Do not rely solely on IP address.
-   Cleanup handled by scheduled task.

# Status

**LOCKED**

Implementation contract for TrustedDevice.
