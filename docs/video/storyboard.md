# Video Showcase Storyboard
## Arrowstack Full Stack Development Internship — Task 1: B2B Order Management Platform

### Overview
- **Target Duration**: 75–90 seconds
- **Format**: Vertical 9:16 (1080 × 1920) or standard 16:9 (1920 × 1080)
- **Target Audience**: Technical Recruiters, Engineering Managers, Tech Leads, LinkedIn Software Engineering Community
- **Core Narrative**: Demonstrate a real-world enterprise wholesale ordering platform featuring PostgreSQL ACID checkout transactions, race condition immunity, role-based access control, and automated PDF tax invoicing.

---

### Timeline & Scene Breakdown

```
[00:00 - 00:08] SCENE 1: HOOK & SYSTEM INTRODUCTION
Visual:
- Hero shot of the Arrowstack B2B Wholesale application running locally.
- Clean header badge: "Arrowstack Wholesale · B2B Logistics Platform".
- On-screen Title overlay:
  "B2B Order Management Platform"
  "Arrowstack Full Stack Development Internship — Task 1"
Narration:
"Welcome to the B2B Order Management Platform built for Arrowstack's Full Stack Development Internship Task 1."

[00:08 - 00:22] SCENE 2: WHOLESALE CATALOG & INVENTORY DISCOVERY
Visual:
- Buyer signs in using 1-click demo button ("Demo Retail Co.").
- User navigates Wholesale Catalog.
- Live search: Typing "Coffee" filters instantly to Single-Origin Arabica.
- Highlight stock status pills: "In Stock", "Only 4 left" (low-stock warning), and tiered wholesale unit pricing.
Narration:
"Business buyers access real-time wholesale inventory with live stock quotas and case pricing, protected by role-based access control."

[00:22 - 00:38] SCENE 3: CART STAGING & TRANSACTIONAL CHECKOUT
Visual:
- Buyer adjusts quantity selector (e.g. 2x Espresso, 1x Shipping Boxes) and clicks "Add to Cart".
- Switches to "Active Wholesale Cart".
- Highlights server-computed totals (Decimal precision, zero floating-point drift).
- Buyer clicks "Confirm & Place Order".
- Loading spinner: "Executing transaction...".
- Order placed notification pops up with confirmation badge.
Narration:
"Checking out initiates a PostgreSQL Serializable transaction. The engine acquires row-level locks, validates inventory, snapshots historical unit prices, and decrements stock atomically with zero race conditions."

[00:38 - 00:52] SCENE 4: ORDER TRACKING & FULFILLMENT STATUS
Visual:
- Automatic navigation to "My Order History".
- Display newly created order `#ORD-...` with status `PENDING`.
- Line items and timestamp visible.
- Invoice column shows "Issued on approval".
Narration:
"The order is safely created in PENDING status. The buyer can review line items, timestamps, and live fulfillment status."

[00:52 - 01:10] SCENE 5: ADMIN CONSOLE & INVENTORY CONTROLS
Visual:
- Seamless switch to Administrator session ("Arrowstack Wholesale HQ").
- Highlight Executive KPI cards: Total Wholesale Revenue, Active Orders count, Catalog Size, Low Stock Alerts.
- Admin transitions the buyer's order from `PENDING` to `APPROVED` using the fulfillment dropdown.
- System instantly creates the unique `Invoice` record (`INV-2026-...`).
- Quick demo of stock adjustment modal: "Adjust Warehouse Stock" from 4 to 25.
Narration:
"Switching to the Admin Console provides live revenue metrics and warehouse controls. Approving the order automatically triggers official tax invoice creation. Administrators can adjust inventory levels or cancel orders with automated stock restoration."

[01:10 - 01:25] SCENE 6: DYNAMIC PDF INVOICE GENERATION & AUDIT TRAIL
Visual:
- Admin clicks "Download INV-2026-..." button.
- PDF opens showing corporate branding, "ARROWSTACK WHOLESALE", Bill To details, itemized table, totals, and Net 30 payment terms.
- Quick cut to "System Audit Trail" tab showing timestamped events (`ORDER_CREATED`, `ORDER_STATUS_APPROVED`).
Narration:
"A production-ready PDF invoice is generated on-the-fly with company details and itemized breakdowns. Every administrative and transactional mutation is permanently logged in the audit trail."

[01:25 - 01:35] SCENE 7: ARCHITECTURE & OUTRO
Visual:
- Closing slide displaying verified technology stack:
  • Next.js 15 App Router & Tailwind CSS
  • NestJS 10 REST API
  • PostgreSQL 16 & Prisma ORM
  • Docker & Docker Compose
  • 29/29 Automated Unit & Integration Tests Passed
- Text: "Built by an Aspiring Full-Stack Software Engineer · Arrowstack Internship Task 1"
Narration:
"Full stack, type-safe, containerized, and fully tested. Thanks for watching!"
```
