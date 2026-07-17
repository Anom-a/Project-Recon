# Project Recon

# Store Application

# 🔒 Database Design – Part 2

**Status:** 🔒 LOCKED

**Application:** `store`

---

# Overview

This document defines the transactional database structure of the Store application.

Part 2 focuses on:

- Shopping Cart
- Shopping Cart Items
- Pending Orders
- Orders
- Order Items
- Guest Customer Information
- Order Status History

Payments belong to the Store application.

---

# Design Principles

- Shopping Carts are temporary.
- Checkout creates a Pending Order.
- Orders are permanent.
- Order Items preserve historical purchase information.
- Guest information belongs to the Order.
- Payment belongs to the Store application via StorePayment.
- Inventory changes only after payment verification.

---

# Entity Relationship Overview

```text
ShoppingCart
      │
      ▼
ShoppingCartItem

----------------------------

PendingOrder
      │
      ▼
PendingOrderItem
      │
      ▼
StorePayment

----------------------------

Order
      │
      ├──────────────┐
      ▼              ▼
OrderItem     OrderStatusHistory
```

---

# ShoppingCart

Represents a temporary cart.

Authenticated users may own one cart.

Guest customers receive a temporary cart session.

---

## Fields

| Field | Type | Required | Description |
|---------|------|----------|-------------|
| id | UUID | ✅ | Primary Key |
| user | FK → User (SET_NULL) | ❌ | Authenticated owner |
| session_key | String(255) | ❌ | Guest session identifier |
| expires_at | DateTime | ✅ | Automatic expiration |
| created_at | DateTime | ✅ | Creation timestamp |
| updated_at | DateTime | ✅ | Last modification |

---

## Business Rules

- Either user or session_key must exist.
- Guests never create user accounts.
- One active cart per authenticated user.
- Carts expire after 30 days.
- Expired carts are automatically removed.

---

## Constraints

Authenticated

```text
One Active Cart per User
```

Guest

```text
One Active Cart per Browser Session
```

---

# ShoppingCartItem

Represents one product inside a Shopping Cart.

---

## Fields

| Field | Type | Required | Description |
|---------|------|----------|-------------|
| id | UUID | ✅ | Primary Key |
| cart | FK → ShoppingCart | ✅ | Parent cart |
| product | FK → Product | ✅ | Selected product |
| branch | FK → Branch | ✅ | Selected branch |
| quantity | Integer | ✅ | Requested quantity |
| created_at | DateTime | ✅ | Creation timestamp |

---

## Business Rules

- Quantity must be greater than zero.
- Product must be active.
- Product must exist in selected branch.
- Inventory is not reserved.

---

## Constraints

Unique

```text
(cart, product, branch)
```

---

# PendingOrder

Represents checkout awaiting payment.

Created immediately before payment initialization.

---

## Fields

| Field | Type | Required | Description |
|---------|------|----------|-------------|
| id | UUID | ✅ | Primary Key |
| user | FK → User (SET_NULL) | ❌ | Authenticated customer |
| branch | FK → Branch (CASCADE) | ✅ | Pickup branch |
| payment_reference | String(255) | ❌ | Payment tracking reference |
| subtotal | Decimal | ✅ | Order subtotal |
| total | Decimal | ✅ | Final payable amount |
| guest_name | String(255) | ❌ | Guest full name |
| guest_email | EmailField(255) | ❌ | Guest email address |
| guest_phone | String(20) | ❌ | Guest phone number |
| expires_at | DateTime | ✅ | Payment timeout |
| created_at | DateTime | ✅ | Creation timestamp |

---

## Business Rules

- Pending Orders expire after 30 minutes.
- No inventory deduction occurs.
- Cannot be modified after payment initialization.
- Guest information is stored directly on the Pending Order (guest_name, guest_email, guest_phone).
- Guest fields are only populated for guest checkout.

---

# StorePayment

Represents a payment record for a Pending Order.

Each Pending Order has exactly one StorePayment.

---

## Fields

| Field | Type | Required | Description |
|---------|------|----------|-------------|
| id | UUID | ✅ | Primary Key |
| pending_order | FK → PendingOrder (CASCADE) | ✅ | The pending order being paid for |
| amount | Decimal | ✅ | Payment amount |
| payment_method | Enum (PaymentMethod) | ✅ | CASH / BANK_TRANSFER / MOBILE_MONEY / CHEQUE |
| transaction_reference | String(255) | ❌ | External transaction reference |
| bank_name | String(255) | ❌ | Bank name (for bank transfers) |
| attachment | File | ❌ | Payment evidence file |
| status | Enum (PaymentStatus) | ✅ | PENDING_VERIFICATION / VERIFIED / REJECTED / CANCELLED |
| payment_date | DateTime | ❌ | Date of payment |
| verified_by | FK → User (PROTECT) | ❌ | Staff who verified the payment |
| verified_at | DateTime | ❌ | Verification timestamp |
| verification_notes | Text | ❌ | Notes from verification |
| created_at | DateTime | ✅ | Creation timestamp |
| updated_at | DateTime | ✅ | Last update |

---

## Payment Statuses

| Status | Description |
|--------|-------------|
| PENDING_VERIFICATION | Awaiting staff verification |
| VERIFIED | Payment confirmed |
| REJECTED | Payment rejected |
| CANCELLED | Payment cancelled |

---

## Payment Methods

| Method | Description |
|--------|-------------|
| CASH | Cash payment at branch |
| BANK_TRANSFER | Bank transfer payment |
| MOBILE_MONEY | Mobile money payment |
| CHEQUE | Cheque payment |

---

## Business Rules

- One-to-one with PendingOrder.
- Cash payments are automatically verified.
- Non-cash payments require manual verification.
- Non-cash payments require at least a transaction_reference or attachment.
- Verified payments trigger Order creation.
- Rejected payments cancel the Pending Order.

---

## Ownership

Owned by:

Pending Order

---

Represents products awaiting payment.

---

## Fields

| Field | Type |
|------|------|
| id | UUID |
| pending_order | FK → PendingOrder |
| product | FK → Product |
| quantity | Integer |
| unit_price | Decimal |
| subtotal | Decimal |

---

## Business Rules

Prices are copied from Product during checkout.

Future product price changes never affect Pending Orders.

---

# Order

Represents a successful purchase.

Created only after payment verification.

---

## Fields

| Field | Type | Required | Description |
|------|------|----------|-------------|
| id | UUID | ✅ | Primary Key |
| order_number | String(50) | ✅ | Human-readable identifier |
| user | FK → User (SET_NULL) | ❌ | Authenticated customer |
| branch | FK → Branch (CASCADE) | ✅ | Pickup branch |
| payment_reference | String(255) | ❌ | Transaction reference |
| subtotal | Decimal | ✅ | Order subtotal |
| total | Decimal | ✅ | Final total |
| status | Enum | ✅ | PAID / PREPARING / READY_FOR_PICKUP / COMPLETED / CANCELLED / REFUNDED |
| paid_at | DateTime | ✅ | Payment timestamp |
| completed_at | DateTime | ❌ | Completion timestamp |
| cancelled_at | DateTime | ❌ | Cancellation timestamp |
| refunded_at | DateTime | ❌ | Refund timestamp |
| guest_name | String(255) | ❌ | Guest full name |
| guest_email | EmailField(255) | ❌ | Guest email |
| guest_phone | String(20) | ❌ | Guest phone |
| created_at | DateTime | ✅ | Creation timestamp |

---

## Guest Information

Guest information is stored directly on the Order.

Same structure as Pending Order guest fields.

---

## Business Rules

- Created only after payment verification.
- Order Number is unique.
- Orders are permanent.
- Orders are never deleted.

---

## Order Statuses

| Status | Description |
|--------|-------------|
| PAID | Payment confirmed, order created |
| PREPARING | Staff are preparing the order |
| READY_FOR_PICKUP | Ready for customer pickup |
| COMPLETED | Customer collected the order |
| CANCELLED | Order was cancelled |
| REFUNDED | Order was refunded |

---

## Status Transitions

```text
PAID
 ↓
PREPARING → CANCELLED
 ↓
READY_FOR_PICKUP → CANCELLED
 ↓
COMPLETED → REFUNDED
```

---

## Order Number

Example

```text
ORD-BRCH-2026-000125
```

Generated after successful payment.

Unique across the Store.

---

# OrderItem

Represents one purchased product.

OrderItems preserve historical purchase information.

---

## Fields

| Field | Type |
|------|------|
| id | UUID |
| order | FK → Order |
| product | FK → Product |
| product_name | String |
| sku | String |
| quantity | Integer |
| unit_price | Decimal |
| subtotal | Decimal |

---

## Why Duplicate Product Information?

Historical orders must remain unchanged.

If later

- Product name changes
- SKU changes
- Product archived

the Order still displays exactly what the customer purchased.

---

## Business Rules

- One Order has many OrderItems.
- Prices never change after purchase.
- Product information is snapshotted.

---

# Order Status History

Tracks every Order status change.

---

## Fields

| Field | Type | Required | Description |
|------|------|----------|-------------|
| id | UUID | ✅ | Primary Key |
| order | FK → Order (CASCADE) | ✅ | Parent order |
| previous_status | Enum | ❌ | Status before change |
| new_status | Enum | ✅ | Status after change |
| changed_by | FK → User (SET_NULL) | ❌ | Staff who performed the change |
| changed_at | DateTime | ✅ | Change timestamp |
| notes | Text | ❌ | Reason or notes |

---

## Business Rules

Every status transition is recorded.

Example

```text
PAID
 ↓
PREPARING
 ↓
READY_FOR_PICKUP
 ↓
COMPLETED
```

Cancellation and refund are also recorded.

History cannot be modified.

---

# Relationships

```text
ShoppingCart
      │
      ▼
ShoppingCartItem

-----------------------

PendingOrder
      │
      ▼
PendingOrderItem
      │
      ▼
StorePayment

-----------------------

Order
      │
      ├─────────────┐
      ▼             ▼
OrderItem   OrderStatusHistory
```

---

# Database Integrity Rules

## Shopping Cart

- One active cart per authenticated user.
- Guest carts use sessions.
- Auto expires.

---

## Pending Order

- Expires after 30 minutes.
- Never deducts inventory.
- Converted into Order after payment verification.

---

## StorePayment

- One-to-one with Pending Order.
- Cash payments are auto-verified.
- Non-cash payments require manual verification.
- Verified payment triggers Order creation.
- Rejected payment cancels the Pending Order.

---

## Order

- Permanent.
- Never deleted.
- One branch only.
- One Order Number only.

---

## OrderItem

- Product snapshot.
- Historical pricing preserved.
- Historical names preserved.

---

## Order Status History

Every status change creates one history record.

History cannot be modified.

---

# Index Recommendations

## ShoppingCart

- user
- session_key
- expires_at

---

## ShoppingCartItem

- cart
- product

---

## PendingOrder

- payment_reference
- expires_at

---

## Order

- order_number
- payment_reference
- branch
- status
- created_at

---

## OrderItem

- order
- product

---

## OrderStatusHistory

- order
- changed_at

---

## StorePayment

- pending_order
- transaction_reference
- status

---

# Part 2 Summary

This document defines:

- ✅ Shopping Cart
- ✅ Shopping Cart Items
- ✅ Pending Orders
- ✅ Pending Order Items
- ✅ Store Payments
- ✅ Orders
- ✅ Order Items
- ✅ Guest Checkout Information
- ✅ Order Status History

Inventory movement and payment processing are handled through the Store Services.

---

# Status

**🔒 LOCKED**
