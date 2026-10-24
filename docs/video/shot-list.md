# Video Production Shot List
## Arrowstack B2B Order Management Platform

| Shot # | Start - End | Scene / Screen | Camera Angle / View | Action & Cursor Movement | Text Overlay / Graphic |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **01** | `00:00 - 00:05` | Landing Page | Full 1080p Desktop View | Slow pan across hero headline and feature cards | Title: **Arrowstack B2B Wholesale Platform**<br>Subtitle: *Internship Task 1 Completion* |
| **02** | `00:05 - 00:10` | Sign In Card | Centered Focus | Click "Buyer: Demo Retail Co." demo button $\rightarrow$ click "Sign In" | Overlay: **Cookie-Based JWT Authentication & RBAC** |
| **03** | `00:10 - 00:18` | Wholesale Catalog | Wide Desktop View | Cursor types "Coffee" in search bar; items filter in real-time | Overlay: **Dynamic Search & Real-time Stock Badging** |
| **04** | `00:18 - 00:24` | Product Card | Tight on Card | Hover over "Only 4 left" badge $\rightarrow$ click `+` to increment quantity $\rightarrow$ click "Add to Cart" | Badge: **Low Stock Warning (Threshold ≤ 10)** |
| **05** | `00:24 - 00:32` | Active Cart View | Split View: Table + Summary | Point to server-computed subtotal $\rightarrow$ click "Confirm & Place Order" | Overlay: **Serializable PostgreSQL ACID Transaction** |
| **06** | `00:32 - 00:40` | Order Placed Toast | Banner notification | Highlight green banner: "Order placed successfully! Inventory reserved atomically" | Notification: **Atomic Stock Decrement & Price Snapshot** |
| **07** | `00:40 - 00:48` | Order History | Table View | Scroll down to view Order `#ORD-...`, items, and `PENDING` badge | Status: **Pending Fulfillment Queue** |
| **08** | `00:48 - 00:58` | Admin Dashboard | Dashboard View | Sign out and sign in as Admin $\rightarrow$ showcase KPI cards ($ Revenue, Active Orders) | Cards: **Real-time Executive Wholesale KPIs** |
| **09** | `00:58 - 01:08` | Order State Transition | Orders Table | Open dropdown $\rightarrow$ change `PENDING` to `APPROVED` $\rightarrow$ invoice link generates | Action: **State Machine: PENDING $\rightarrow$ APPROVED** |
| **10** | `01:08 - 01:18` | PDF Invoice Preview | Modal / PDF Viewer | Click `INV-2026-XXXXX` button $\rightarrow$ display corporate PDF invoice | Overlay: **Automated PDFKit Tax Invoicing Engine** |
| **11** | `01:18 - 01:25` | System Audit Trail | Admin Audit Table | Scroll through audit log rows showing timestamped actions | Tag: **Immutable Audit Logging & Compliance** |
| **12** | `01:25 - 01:35` | Architecture Outro | Clean Slate Card | Display Next.js 15, NestJS 10, PostgreSQL, Prisma, Docker badges | **Arrowstack Internship Task 1 Verified**<br>29/29 Tests Passed |
