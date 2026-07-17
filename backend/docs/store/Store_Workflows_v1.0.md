# Project Recon

# Store Application Workflows v1.0

**Status:** LOCKED

**Application:** `store`

---

This document describes each business workflow scenario end-to-end, showing which services are called, what validation occurs, and what side effects happen.

---

# 1. Create Product Category

**Purpose:** Administrator creates a new product category.

```text
[Admin] → CategoryService.create_category()
  │
  ├── Validates:
  │     - Name is not empty
  │     - Name is unique (case-insensitive)
  │
  ├── ProductCategory.objects.create()
  │     name, description
  │
  └── Returns ProductCategory
```

**Entry point:** POST /api/v1/store/admin/categories/

**Roles allowed:** Super Admin

---

# 2. Update Product Category

**Purpose:** Administrator updates an existing category.

```text
[Admin] → CategoryService.update_category()
  │
  ├── Validates:
  │     - Name uniqueness (case-insensitive, excluding self)
  │
  ├── ProductCategory.save()
  │
  └── Returns updated ProductCategory
```

**Entry point:** PATCH /api/v1/store/admin/categories/{id}/

**Roles allowed:** Super Admin

---

# 3. Create Product

**Purpose:** Administrator adds a new product to the catalog.

```text
[Admin] → ProductService.create_product()
  │
  ├── Resolves category
  ├── Validates:
  │     - Category exists and is active
  │     - SKU is unique (case-insensitive)
  │     - Slug is unique (case-insensitive)
  │
  ├── Product.objects.create()
  │
  └── Returns Product
```

**Entry point:** POST /api/v1/store/admin/products/

**Roles allowed:** Super Admin

---

# 4. Archive Product

**Purpose:** Administrator archives a product so it can no longer be purchased.

```text
[Admin] → ProductService.archive_product()
  │
  ├── Sets archived_at = now()
  ├── Sets is_active = False
  ├── Product.save()
  │
  └── Returns archived Product
```

**Entry point:** POST /api/v1/store/admin/products/{id}/archive/

**Roles allowed:** Super Admin

---

# 5. Restore Archived Product

**Purpose:** Administrator restores an archived product back to active status.

```text
[Admin] → ProductService.restore_product()
  │
  ├── Sets archived_at = None
  ├── Sets is_active = True
  ├── Product.save()
  │
  └── Returns restored Product
```

**Entry point:** POST /api/v1/store/admin/products/{id}/restore/

**Roles allowed:** Super Admin

---

# 6. Upload Product Image

**Purpose:** Administrator uploads an image for a product.

```text
[Admin] → ProductImageService.upload_image()
  │
  ├── Determines display_order (last order + 1)
  ├── ProductImage.objects.create()
  │     product, image, alt_text, is_primary, display_order
  │
  └── Returns ProductImage
```

**Entry point:** POST /api/v1/store/admin/products/{product_pk}/images/

**Roles allowed:** Super Admin

---

# 7. Set Primary Product Image

**Purpose:** Administrator marks a specific image as the primary image for a product.

```text
[Admin] → ProductImageService.set_primary_image()
  │
  ├── Unsets is_primary on all other images for this product
  ├── Sets is_primary = True on target image
  ├── ProductImage.save()
  │
  └── Returns updated ProductImage
```

**Entry point:** POST /api/v1/store/admin/product-images/{pk}/set-primary/

**Roles allowed:** Super Admin

---

# 8. Add Inventory to Branch

**Purpose:** Administrator adds stock quantity for a product in a specific branch.

```text
[Admin] → BranchInventoryService.add_inventory()
  │
  ├── Validates:
  │     - Quantity > 0
  │
  ├── Gets or creates BranchInventory record
  ├── Adds quantity to existing stock
  ├── BranchInventory.save()
  │
  └── Returns BranchInventory
```

**Entry point:** POST /api/v1/store/admin/inventory/{pk}/add/

**Roles allowed:** Super Admin, Branch Manager

---

# 9. Reduce Inventory from Branch

**Purpose:** Administrator reduces stock quantity for a product in a branch.

```text
[Admin] → BranchInventoryService.reduce_inventory()
  │
  ├── Validates:
  │     - Quantity > 0
  │     - Available stock >= requested reduction
  │
  ├── Subtracts quantity
  ├── BranchInventory.save()
  │
  └── Returns BranchInventory
```

**Entry point:** POST /api/v1/store/admin/inventory/{pk}/reduce/

**Roles allowed:** Super Admin, Branch Manager

---

# 10. Transfer Inventory Between Branches

**Purpose:** Administrator transfers stock from one branch to another.

```text
[Admin] → BranchInventoryService.transfer_inventory()
  │
  ├── Validates:
  │     - Quantity > 0
  │     - Source and destination are different
  │     - Source has sufficient stock
  │
  ├── reduce_inventory(source_branch)
  ├── add_inventory(destination_branch)
  │
  └── Returns {source: BranchInventory, destination: BranchInventory}
```

**Entry point:** POST /api/v1/store/admin/inventory/transfer/

**Roles allowed:** Super Admin

---

# 11. Add Item to Shopping Cart

**Purpose:** Customer adds a product to their shopping cart.

```text
[Customer] → ShoppingCartService.add_to_cart()
  │
  ├── Resolves product and branch
  ├── Validates:
  │     - Quantity > 0
  │     - Product is active and not archived
  │     - Branch has sufficient stock
  │
  ├── Creates or updates ShoppingCartItem
  ├── Touches cart (extends expiration)
  │
  └── Returns ShoppingCartItem
```

**Entry point:** POST /api/v1/store/cart/items/

**Roles allowed:** Any (authenticated or guest via session_key)

---

# 12. Remove Item from Shopping Cart

**Purpose:** Customer removes a product from their cart.

```text
[Customer] → ShoppingCartService.remove_from_cart()
  │
  ├── Validates:
  │     - Item belongs to cart
  │
  ├── ShoppingCartItem.delete()
  ├── Touches cart
  │
  └── Returns None
```

**Entry point:** POST /api/v1/store/cart/items/{pk}/remove/

**Roles allowed:** Any (authenticated or guest)

---

# 13. Checkout

**Purpose:** Customer converts their shopping cart into a Pending Order with optional payment evidence.

```text
[Customer] → CheckoutService.checkout()
  │
  ├── Validates:
  │     - Cart is not empty
  │     - All products are active
  │     - Sufficient stock for all items
  │     - Branch is valid
  │
  ├── Calculates subtotal and total
  ├── PendingOrder.objects.create()
  ├── PendingOrderItem.objects.create() for each cart item
  │     (snapshots product name, SKU, price)
  │
  ├── If payment_data provided:
  │     └── PaymentService.submit_payment_evidence()
  │           Creates StorePayment in PENDING_VERIFICATION status
  │
  ├── Clears cart items
  │
  └── Returns PendingOrder with items
```

**Entry point:** POST /api/v1/store/cart/checkout/

**Roles allowed:** Any (authenticated or guest)

---

# 14. Submit Payment Evidence

**Purpose:** Customer submits payment evidence for a pending order.

```text
[Customer] → PaymentService.submit_payment_evidence()
  │
  ├── Validates:
  │     - PendingOrder exists
  │     - No existing payment for this PendingOrder
  │     - Amount > 0
  │
  ├── StorePayment.objects.create()
  │     status = PENDING_VERIFICATION
  │
  ├── log_action(payment.evidence_submitted)
  │
  └── Returns StorePayment
```

**Entry point:** POST /api/v1/store/pending-orders/{pending_order_pk}/evidence/

**Roles allowed:** Any (authenticated or guest who owns the PendingOrder)

---

# 15. Record Cash Payment

**Purpose:** Staff records a cash payment at the branch, auto-verifying it.

```text
[Staff] → PaymentService.record_cash_payment()
  │
  ├── Validates:
  │     - PendingOrder exists
  │     - No existing payment for this PendingOrder
  │     - Amount > 0
  │
  ├── StorePayment.objects.create()
  │     payment_method = CASH
  │     status = VERIFIED
  │     verified_by = staff
  │
  ├── log_action(payment.cash_recorded)
  │
  ├── OrderService.create_order_from_pending_order()
  │     └── (see Workflow 17)
  │
  └── Returns StorePayment
```

**Entry point:** POST /api/v1/store/admin/pending-orders/{pk}/cash/

**Roles allowed:** Super Admin, Branch Manager

---

# 16. Verify Payment

**Purpose:** Staff verifies a non-cash payment, confirming it is genuine.

```text
[Staff] → PaymentService.verify_payment()
  │
  ├── Validates:
  │     - Payment record exists
  │     - Payment status is PENDING_VERIFICATION
  │
  ├── Sets:
  │     status = VERIFIED
  │     verified_by = staff
  │     verified_at = now()
  │
  ├── log_action(payment.verified)
  │
  ├── OrderService.create_order_from_pending_order()
  │     └── (see Workflow 17)
  │
  └── Returns StorePayment
```

**Entry point:** POST /api/v1/store/admin/pending-orders/{pk}/verify/

**Roles allowed:** Super Admin, Branch Manager

---

# 17. Reject Payment

**Purpose:** Staff rejects a non-cash payment as invalid.

```text
[Staff] → PaymentService.reject_payment()
  │
  ├── Validates:
  │     - Payment record exists
  │     - Payment status is PENDING_VERIFICATION
  │     - Verification notes are provided
  │
  ├── Sets:
  │     status = REJECTED
  │     verified_by = staff
  │     verified_at = now()
  │     verification_notes = notes
  │
  ├── log_action(payment.rejected)
  │
  ├── PendingOrderService.cancel_pending_order()
  │     └── log_action(pending_order.cancelled)
  │     └── pending_order.delete()
  │
  └── Returns StorePayment
```

**Entry point:** POST /api/v1/store/admin/pending-orders/{pk}/reject/

**Roles allowed:** Super Admin, Branch Manager

---

# 18. Create Order from PendingOrder (Internal)

**Purpose:** Convert a verified PendingOrder into a confirmed Order.

```text
[Internal] → OrderService.create_order_from_pending_order()
  │
  ├── Validates:
  │     - Payment exists and status is VERIFIED
  │     - No existing Order for this payment (idempotent)
  │
  ├── Generates order number:
  │     ORD-{branch.code}-{year}-{sequential:06d}
  │
  ├── Order.objects.create()
  │     status = PAID
  │     paid_at = now()
  │
  ├── OrderItem.objects.create() for each PendingOrderItem
  │     (snapshots product_name, sku, unit_price)
  │
  ├── OrderStatusHistory.objects.create()
  │     (none → PAID)
  │
  ├── BranchInventoryService.reduce_inventory()
  │     for each item in the order
  │
  ├── NotificationService.notify_payment_and_order_confirmed()
  │
  └── Returns Order
```

**Entry point:** Called internally by PaymentService.verify_payment() and PaymentService.record_cash_payment()

---

# 19. Change Order Status

**Purpose:** Staff updates the status of an order, with side effects.

```text
[Staff] → OrderService.change_order_status()
  │
  ├── Validates:
  │     - Target status is valid
  │     - Transition is allowed (see status transition matrix)
  │
  ├── Updates Order:
  │     status = new_status
  │     If COMPLETED → completed_at = now()
  │     If CANCELLED → cancelled_at = now()
  │     If REFUNDED → refunded_at = now()
  │
  ├── OrderStatusHistory.objects.create()
  │     previous_status, new_status, changed_by, notes
  │
  ├── If CANCELLED or REFUNDED:
  │     └── BranchInventoryService.add_inventory()
  │           restore stock for each item
  │
  ├── log_action(ORDER_STATUS_CHANGED)
  │
  ├── Trigger notifications:
  │     READY_FOR_PICKUP  → notify_ready_for_pickup()
  │     COMPLETED         → notify_order_completed()
  │     CANCELLED         → notify_cancelled()
  │     REFUNDED          → notify_refund()
  │
  └── Returns Order
```

**Entry point:** POST /api/v1/store/admin/orders/{pk}/status/

**Roles allowed:** Super Admin, Branch Manager

---

# 20. List Payments

**Purpose:** Staff views payment records, optionally filtered.

```text
[Staff] → PaymentService.list_payments()
  │
  ├── Filters:
  │     - By status (optional)
  │     - By pending_order_id (optional)
  │
  ├── Selects related:
  │     - pending_order__branch
  │     - pending_order__user
  │     - verified_by
  │
  └── Returns list of StorePayment
```

**Entry point:** GET /api/v1/store/admin/payments/

**Roles allowed:** Super Admin, Branch Manager

---

# 21. Generate Reports

**Purpose:** Staff views business analytics and exports.

```text
[Staff] → ReportService
  │
  ├── Product Statistics:
  │     ReportService.product_statistics()
  │     → summary (total/active/archived), price stats, by category
  │
  ├── Inventory Report:
  │     ReportService.inventory_report(branch_id?)
  │     → per-branch product quantities
  │
  ├── Low Stock Report:
  │     ReportService.low_stock_report()
  │     → items below minimum or out of stock
  │
  ├── Sales Report:
  │     ReportService.sales_report(start, end, branch, group_by)
  │     → aggregated revenue, order count, avg value
  │
  ├── Order Report:
  │     ReportService.order_report(status, branch, start, end)
  │     → order trends over time
  │
  ├── Branch Sales Report:
  │     ReportService.branch_sales_report(branch, group_by)
  │     → per-branch revenue breakdown
  │
  └── Each can be exported as CSV via CsvExportService
```

**Entry points:**
- GET /api/v1/store/admin/reports/products/
- GET /api/v1/store/admin/reports/inventory/
- GET /api/v1/store/admin/reports/low-stock/
- GET /api/v1/store/admin/reports/sales/
- GET /api/v1/store/admin/reports/orders/
- GET /api/v1/store/admin/reports/branch-sales/

**Roles allowed:** Super Admin, Branch Manager

---

# Status

**🔒 LOCKED**
