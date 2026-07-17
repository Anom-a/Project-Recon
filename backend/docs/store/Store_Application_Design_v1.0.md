# Project Recon

# Store Application

# 🔒 Architecture Design

**Status:** 🔒 LOCKED

**Application:** `store`

---

# Overview

The Store application provides a complete e-commerce solution for Project Recon.

Its primary purpose is to allow customers to purchase physical products from the organization's branches while providing staff with inventory and order management capabilities.

The Store integrates with:

- Accounts
- Store Payment Service
- Store Notification Service
- Shared Audit
- Branch Management

The Store **never communicates directly with payment providers except Chapa/Stripe**. Payment processing is handled by the Store's own Payment Service.

---

# Core Principles

- Physical products only.
- One Product exists globally.
- Product prices are global.
- Inventory is managed independently by each branch.
- Customers can view stock availability across all branches.
- One Order belongs to one Branch.
- Guest checkout is supported.
- Authenticated customers are supported.
- Shopping Cart is temporary.
- Checkout creates a Pending Order.
- Payment is required before an Order is confirmed.
- Pending Orders automatically expire if payment is not completed.
- Inventory is reduced only after successful payment verification.
- Customers cannot cancel paid orders.
- Refunds are handled manually by authorized staff.
- Order confirmation emails are sent by Store Notification Service.
- Audit logging is delegated to Shared Audit.

---

# Business Modules

The Store application consists of the following business domains:

- Product Catalog
- Product Categories
- Product Images
- Branch Inventory
- Shopping Cart
- Checkout
- Pending Orders
- Orders
- Payments
- Inventory Management
- Reports

---

# Product Catalog

The Product Catalog contains every physical product offered by the organization.

Examples:

- Robotics Kits
- Motors
- Sensors
- Electronics
- Competition Parts
- Books
- Apparel
- Accessories

Each Product:

- belongs to one Category
- has one global selling price
- may have multiple images
- may exist in multiple branches
- may be activated or archived

Products represent the organization's inventory items, not branch-specific stock.

---

# Categories

Categories organize products into logical groups.

Examples:

- Robotics Kits
- Parts
- Electronics
- Apparel
- Books
- Accessories

Categories are managed only by administrators.

Products always belong to one Category.

---

# Product Images

Each Product may have multiple images.

## Business Rules

- Multiple images are supported.
- One image is marked as the Primary Image.
- Images have display order.
- Primary Image is displayed in product listings.
- Additional images are shown on the Product details page.

---

# Branch Inventory

Inventory belongs to branches.

Products never store stock quantities.

## Relationship

```text
Product
      │
      ▼
Branch Inventory
```

Example

```text
Robotics Kit

Addis Branch
12 Available

-------------------

Bole Branch
5 Available

-------------------

Adama Branch
Out of Stock
```

Customers can view inventory availability for every branch before purchasing.

Prices remain identical across all branches.

---

# Shopping Cart

The Shopping Cart is temporary.

Its purpose is to prepare a purchase.

Customers may:

- Add Products
- Remove Products
- Update Quantities
- View Totals

The Shopping Cart is not a permanent business record.

No inventory is reserved while items remain in the Shopping Cart.

## Cart Expiration

Shopping Carts automatically expire.

### Business Rules

- Shopping Carts expire after **30 days** of inactivity.
- Expired Shopping Carts are automatically removed.
- Expired Shopping Carts never affect inventory.
- Expired Shopping Carts never create Orders.

---

# Checkout

Checkout transforms the Shopping Cart into a Pending Order.

Before checkout succeeds the system validates:

- Product exists
- Product is active
- Requested quantity
- Branch inventory
- Product pricing

Only successful validation allows payment initialization.

---

# Pending Order

A Pending Order represents a purchase awaiting payment.

## Purpose

- Preserve checkout information.
- Provide a payment reference.
- Prevent duplicate Orders.
- Track payment progress.

A Pending Order is not yet considered a successful purchase.

## Pending Order Expiration

Pending Orders automatically expire.

### Business Rules

- Pending Orders expire after **30 minutes** if payment is not successfully verified.
- Expired Pending Orders cannot be completed.
- Customers must restart Checkout after expiration.

---

# Payment Flow

Payment is handled by the Store application through manual verification.

## Workflow (Non-Cash Payment)

```text
Shopping Cart
        │
        ▼
Checkout
        │
        ▼
Pending Order
        │
        ▼
Customer Submits Payment Evidence
        │
        ▼
Store Payment Service
        │
        ▼
Staff Verifies Payment
        │
        ├─────────────┐
        ▼             ▼
    Verified       Rejected
        │             │
        ▼             ▼
  Confirm Order    Cancel Pending
        │
        ▼
  Reduce Inventory
        │
        ▼
  Generate Order Number
        │
        ▼
  Confirmation Email
```

## Workflow (Cash Payment)

```text
Shopping Cart
        │
        ▼
Checkout
        │
        ▼
Pending Order
        │
        ▼
Staff Records Cash Payment
        │
        ▼
Auto-Verified
        │
        ▼
Confirm Order
        │
        ▼
Reduce Inventory
        │
        ▼
Generate Order Number
```

The Store accepts the following payment methods:

- Cash (auto-verified at branch)
- Bank Transfer (manual verification)
- Mobile Money (manual verification)
- Cheque (manual verification)

---

# Order Confirmation

After successful payment verification:

- Payment is confirmed.
- Order becomes **PAID**.
- Inventory is reduced.
- Order Number is generated.
- Confirmation Email is sent.
- Staff may begin fulfillment.

---

# Order Number

Every confirmed Order contains:

### Internal Identifier

```text
UUID
```

### Customer Identifier

```text
ORD-branch initials-2026-000001
```

The Order Number is used for:

- Customer communication
- Pickup
- Staff lookup
- Email notifications

Customers never interact with internal UUIDs.

---

# Order Processing

After payment, staff fulfill the Order.

## Workflow

```text
PAID

↓

PREPARING

↓

READY_FOR_PICKUP

↓

COMPLETED
```

### Additional Statuses

- CANCELLED
- REFUNDED

Customers cannot cancel paid Orders.

Refunds and cancellations are administrative actions only.

---

# Pickup

After payment the customer receives:

- Order Number
- Confirmation Email

When collecting an Order the customer presents either:

- Order Number

or

- Confirmation Email

Staff locate the Order.

Verify the customer.

Hand over the Products.

Mark the Order as **COMPLETED**.

---

# Guest Checkout

Guests may purchase Products without creating an Account.

The following information is collected:

- Full Name
- Email Address
- Phone Number

Guest information is stored with the Order.

It is used for:

- Payment
- Order Confirmation
- Pickup Verification
- Customer Communication

Guest checkout never creates a User account.

---

# Authenticated Customers

Authenticated customers may:

- Browse Products
- Purchase Products
- View Order History
- Track Order Status

Their existing Account information is reused during Checkout.

---

# Inventory Management

Inventory belongs to Branches.

Each Branch manages its own stock.

Products remain global.

Example

```text
Robot Kit

↓

Addis Branch
15

↓

Bole Branch
8

↓

Adama Branch
0
```

Inventory is reduced only after successful payment verification.

No stock reservation occurs before payment.

---

# Refunds & Administrative Cancellations

Customers cannot cancel paid Orders.

When exceptional situations occur, authorized staff may manually perform:

- Refunds
- Administrative Cancellations

These actions follow the organization's internal business procedures.

Payment processing remains the responsibility of the Store Payment Service.

---

# Email Notifications

The Store sends notifications through its own Notification Service, which uses the Shared Email service.

Notifications include:

- Payment Confirmed
- Order Confirmed
- Ready for Pickup
- Order Completed
- Cancellation Notice
- Refund Processed

The Store Notification Service constructs email content for store-specific events.

---

# Audit Logging

All significant Store actions are recorded through the Shared Audit application.

Examples:

- Product creation
- Product updates
- Product archival
- Inventory adjustments
- Order status changes
- Refund processing
- Administrative actions

---

# Reports

The Store provides built-in reporting capabilities.

## Product Reports

- Product statistics (total, active, archived, by category)
- Price statistics (min, max, average)

## Inventory Reports

- Full inventory snapshot (optionally filtered by branch)
- Low-stock report (items below minimum quantity or out of stock)

## Sales Reports

- Sales aggregated by day, week, or month
- Filterable by date range and branch
- Revenue, order count, and average order value

## Order Reports

- Order trends over time
- Filterable by status, branch, and date range

## Branch Sales Reports

- Per-branch sales breakdown
- Revenue and order count per branch

---

# Roles & Permissions

## Super Admin

Full Store access.

May manage:

- Products
- Categories
- Inventory
- Orders
- Reports

---

## Branch Manager

Scoped to assigned Branches.

May manage:

- Branch Inventory
- Branch Orders
- Pickup
- Order Processing

Cannot access other Branches.

---

## Customer

Authenticated customers may:

- Browse Products
- Purchase Products
- View own Orders
- Track Order Status

---

## Guest Customer

May:

- Browse Products
- Purchase Products
- Receive Email Notifications

Guests cannot view historical Orders after purchase.

---

# Integration with Other Applications

## Accounts

Provides authenticated users and staff.

---

## Store Payment Service

Responsible for:

- Payment Evidence Submission
- Payment Verification
- Cash Payment Recording
- Manual Payment Rejection
- Payment Status Management (PENDING_VERIFICATION, VERIFIED, REJECTED, CANCELLED)

---

## Store Notification Service

Responsible for:

- Order Confirmation Emails
- Ready for Pickup Notifications
- Completion Notifications
- Cancellation Notices
- Refund Notifications

Uses the Shared Email service to send notifications.

---

## Shared Audit

Responsible for:

- Audit Logs
- Administrative History
- Inventory History
- Order Activity

---

## Branch Management

Provides:

- Branch Information
- Branch Ownership
- Inventory Ownership
- Pickup Location

---

# Overall Business Flow

```text
Products Published
        │
        ▼
Customer Browses Store
        │
        ▼
Shopping Cart
        │
        ▼
Checkout
        │
        ▼
Pending Order
        │
        ▼
Submit Payment Evidence
        │
        ▼
Staff Verifies Payment
        │
        ├─────────────┐
        ▼             ▼
    Verified       Rejected
        │             │
        ▼             ▼
Order Confirmed   Pending Order Cancelled
        │
        ▼
Reduce Branch Inventory
        │
        ▼
Generate Order Number
        │
        ▼
Confirmation Email
        │
        ▼
Preparing
        │
        ▼
Ready For Pickup
        │
        ▼
Customer Pickup
        │
        ▼
Completed
```

---

# Locked Business Rules

- Only physical products are supported.
- Products exist globally.
- Product prices are global.
- Inventory belongs to Branches.
- Customers can view stock availability for every Branch.
- Products support multiple images.
- One Product Image is designated as the Primary Image.
- Shopping Carts are temporary.
- Shopping Carts expire after **30 days** of inactivity.
- Checkout creates a Pending Order.
- Pending Orders expire after **30 minutes** if payment is not successfully verified.
- One Order belongs to exactly one Branch.
- Orders are confirmed only after successful payment verification.
- Payments are processed through the Store Payment Service.
- Cash payments are auto-verified at the branch.
- Non-cash payments (bank transfer, mobile money, cheque) require manual verification by staff.
- Rejected payments cancel the Pending Order.
- Inventory is reduced only after successful payment verification.
- Inventory is never reserved before payment.
- Guest customer information is stored with the Order.
- Customers cannot cancel paid Orders.
- Refunds and administrative cancellations are performed only by authorized staff.
- Every confirmed Order receives a human-readable Order Number.
- Email notifications are sent by the Store Notification Service via Shared Email.
- Significant Store actions are recorded through the Shared Audit application.
- Branch Managers operate only within their assigned Branches.
- Reports provide product, inventory, sales, and order analytics.

---

# Status

**🔒 LOCKED**
