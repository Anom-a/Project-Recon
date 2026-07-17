# Project Recon

# Store Application

# 🔒 Services Design

**Status:** 🔒 LOCKED

**Application:** `store`

---

# Overview

This document defines the business services responsible for implementing the Store application's business logic.

Services encapsulate all business rules.

Views remain thin.

Models only store data.

Every modification to Store data passes through a Service.

---

# Design Principles

- Services own all business logic.
- Models never perform business operations.
- Views never contain business rules.
- Services communicate with Store Payment Service.
- Services communicate with Store Notification Service.
- Services communicate with Shared Audit.
- Services never communicate directly with payment providers except through the Store Payment Service.
- Services are reusable across APIs, Admin actions, and future integrations.

---

# Service Overview

The Store application consists of the following services:

- Category Service
- Product Service
- Product Image Service
- Branch Inventory Service
- Shopping Cart Service
- Checkout Service
- Pending Order Service (includes expiration cleanup)
- Order Service
- Payment Service
- Notification Service
- Report Service
  - OrderReportService
  - InventoryReportService
  - PaymentReportService
  - SalesReportService
  - CsvExportService

---

# Category Service

## Responsibilities

- Create category
- Update category
- Activate category
- Deactivate category
- Validate uniqueness
- Prevent deletion while products exist

## Does NOT

- Manage products
- Manage inventory

---

# Product Service

## Responsibilities

- Create products
- Update products
- Archive products
- Restore archived products
- Activate products
- Deactivate products
- Validate SKU uniqueness
- Validate slug uniqueness

## Business Rules

- Products are global.
- Products own no inventory.
- Archived products cannot be purchased.
- Archived products remain visible in historical orders.

---

# Product Image Service

## Responsibilities

- Upload images
- Delete images
- Change primary image
- Reorder images

## Business Rules

- One primary image per product.
- Display order remains unique.
- Removing a primary image automatically promotes another image.

---

# Branch Inventory Service

## Responsibilities

- Add inventory
- Reduce inventory
- Transfer inventory between branches
- Correct inventory
- Validate stock availability

## Business Rules

- Inventory belongs to branches.
- Quantity can never become negative.
- Inventory updates generate audit records.

This service never processes customer purchases.

---

# Shopping Cart Service

## Responsibilities

- Create shopping cart
- Retrieve shopping cart
- Add products
- Remove products
- Update quantities
- Clear cart
- Delete expired carts

---

## Business Rules

Authenticated Users

- One active cart per user.
- Cart persists between sessions.
- Cart expires after 30 days of inactivity.

Guest Users

- One temporary cart per browser session.
- Cart exists only while the browser session is active.
- Closing the browser removes the cart.
- Guest carts are never stored as permanent business records.

---

## Validation

Before adding an item:

- Product exists
- Product is active
- Branch exists
- Inventory record exists
- Quantity > 0

Inventory is **not reserved**.

---

# Checkout Service

## Responsibilities

- Validate shopping cart
- Calculate totals
- Create Pending Order
- Create PendingOrderItem snapshots
- Submit payment evidence (if provided during checkout)
- Clear the shopping cart after checkout
- Collect guest information (name, email, phone)

---

## Validation

Checks

- Product availability
- Branch inventory
- Product status
- Quantities
- Prices

If validation fails

Checkout is rejected.

---

## Does NOT

- Deduct inventory
- Confirm payment
- Create completed orders
- Verify payments

---

# Pending Order Service

## Responsibilities

- Create pending order
- Store checkout snapshot
- Store guest information
- Track payment state
- Expire unpaid pending orders
- Cancel pending order (for rejected payments)
- Retrieve pending orders by user

---

## Business Rules

- Pending Orders expire after 30 minutes.
- Pending Orders cannot be modified after payment initialization.
- Expired Pending Orders cannot be reused.

---

# Order Service

## Responsibilities

- Create confirmed order (from PendingOrder after payment verification)
- Generate order number
- Copy purchased items with historical data
- Maintain order history
- Change order status (with transition validation)
- Restore inventory on cancellation or refund
- Trigger notifications on status changes

---

## Creates

- Order
- Order Items
- Order Status History

---

## Business Rules

Orders are created **only** after successful payment verification.

Order numbers are unique.

Example

```text
ORD-BRCH-2026-000245
```

Historical product information is copied into Order Items.

Future product changes never affect historical orders.

---

## Order Status Management

Allowed transitions

```text
PAID

↓

PREPARING → CANCELLED

↓

READY_FOR_PICKUP → CANCELLED

↓

COMPLETED → REFUNDED
```

Administrative transitions

```text
PAID → REFUNDED
```

Every transition creates an Order Status History record.

### Side Effects by Status

- **CANCELLED / REFUNDED**: Inventory is restored (items returned to stock).
- **READY_FOR_PICKUP**: Customer notified that order is ready.
- **COMPLETED**: Customer notified that order is complete.

---

# Payment Service

## Responsibilities

- Submit payment evidence (for non-cash payments)
- Record cash payments
- Verify payments (change status to VERIFIED)
- Reject payments (change status to REJECTED)
- List payments (filtered by status or pending order)
- Trigger Order creation on verification

---

## Payment Statuses

```text
PENDING_VERIFICATION

↓

VERIFIED  →  Order Created

↓

REJECTED  →  Pending Order Cancelled

↓

CANCELLED
```

---

## Business Rules

- Cash payments are recorded directly as VERIFIED.
- Non-cash payments start as PENDING_VERIFICATION.
- Only PENDING_VERIFICATION payments can be verified or rejected.
- Verification notes are required when rejecting a payment.
- Verification creates an Order through the Order Service.
- One payment per Pending Order.

---

# Notification Service

## Responsibilities

- Send order confirmation email (payment verified)
- Send ready-for-pickup notification
- Send order completion notification
- Send cancellation notice
- Send refund notification

---

## Events

- `notify_payment_and_order_confirmed` — sent when payment is verified and order is created
- `notify_ready_for_pickup` — sent when order status changes to READY_FOR_PICKUP
- `notify_order_completed` — sent when order status changes to COMPLETED
- `notify_cancelled` — sent when order is cancelled
- `notify_refund` — sent when refund is processed

---

## Business Rules

- Notifications are sent via Shared Email service.
- Recipient is determined by Order: authenticated user's email or guest email.
- Notifications are best-effort; failures are logged.
- Notification content is owned by the Store.

---

# Report Service

Provides business analytics for the Store.

## Sub-Services

### OrderReportService

- Order trends over time (daily, weekly, monthly)
- Filterable by status, branch, and date range

### InventoryReportService

- Full inventory snapshot per branch
- Low-stock report (items below minimum or out of stock)

### PaymentReportService

- Payment status breakdown
- Payment method distribution

### SalesReportService

- Sales aggregated by day, week, or month
- Revenue, order count, average order value
- Per-branch sales breakdown
- Product statistics (total, active, archived, by category)

### CsvExportService

- Export any report data as CSV
- Uses `StreamingHttpResponse` for efficient large exports

---

## Report Endpoints

```text
admin/reports/products/       — Product statistics
admin/reports/inventory/      — Full inventory snapshot
admin/reports/low-stock/      — Low stock items
admin/reports/sales/          — Sales trends
admin/reports/orders/         — Order trends
admin/reports/branch-sales/   — Per-branch sales
```

---

# Store Payment Service Integration

The Store owns its payment records.

Workflow

```text
Checkout Service

↓

Pending Order Service

↓

Payment Service (submit evidence / record cash)

↓

Payment Service (verify / reject)

↓

Order Service (create order)

↓

Notification Service (send confirmation)
```

---

# Shared Audit Integration

Every significant operation records an audit event.

Examples

- Category created
- Product archived
- Inventory updated
- Pending Order expired
- Order created
- Refund processed

Audit storage belongs to Shared Audit.

---

# Overall Service Flow

```text
Shopping Cart

↓

Shopping Cart Service

↓

Checkout Service

↓

Pending Order Service

↓

Payment Service (submit evidence / record cash)

↓

Payment Service (verify / reject)

↓

Order Service

↓

Notification Service

↓

Shared Audit
```

---

# Service Dependencies

```text
Category Service

↓

Product Service

↓

Product Image Service

↓

Branch Inventory Service

↓

Shopping Cart Service

↓

Checkout Service

↓

Pending Order Service

↓

Payment Service

↓

Order Service

↓

Notification Service

↓

Report Service

↓

Shared Audit
```

---

# Locked Service Rules

- Services own all business logic.
- Views remain thin.
- Models remain passive.
- Products never own inventory.
- Inventory belongs to branches.
- Guest carts exist only during the active browser session.
- Authenticated carts expire after 30 days of inactivity.
- Checkout validates inventory but never reserves it.
- Checkout creates Pending Orders.
- Pending Orders expire after 30 minutes.
- Orders are created only after successful payment verification.
- Cash payments are auto-verified.
- Non-cash payments require manual verification.
- Only PENDING_VERIFICATION payments can be verified or rejected.
- Inventory is deducted only after successful payment verification.
- Product information is snapshotted into Order Items.
- Order status transitions create history records.
- Cancellation and refund restore inventory.
- Store Payment Service owns payment records.
- Store Notification Service sends customer notifications.
- Shared Audit owns audit records.
- Report Service provides analytics and CSV export.

---

# Status

**🔒 LOCKED**
