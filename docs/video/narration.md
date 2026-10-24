# LinkedIn Video Script — Arrowstack B2B Order Management Platform
# Screen Recording Walkthrough: 45-60 Seconds

---

## VISUAL BLUEPRINT (Scene-by-Scene)

---

### SCENE 1 — Title Card (0:00 - 0:08)

Visuals:
- Dark-mode title card overlay (CapCut / DaVinci Resolve / Canva)
  - Title: "B2B Order Management Platform"
  - Subtitle: "Arrowstack Full Stack Dev Internship — Task 1"
  - Tech badges: Next.js 15 | NestJS | PostgreSQL | Prisma | Docker | JWT
- Fade-in transition, cut to live browser at http://localhost:3000

Narration:
"Here's my full-stack B2B wholesale order platform — built end-to-end for the Arrowstack internship!"

---

### SCENE 2 — Auth & Role-Based Access (0:08 - 0:20)

Visuals (record in this order):
1. Show login screen — type admin@arrowstack.dev + password, hit Login
2. Admin dashboard loads — highlight the ADMIN badge in the navbar
3. Logout — log in as buyer@demo.com
4. Buyer dashboard loads — admin controls not visible, role gates working

On-Screen Callout (add in editing):
"JWT Bearer Auth | Bcrypt Password Hashing | Role-Based UI (ADMIN / BUYER)"

Narration:
"Secure JWT authentication with bcrypt hashing and strict role-based access control —
admins and buyers each see only what they are authorized for."

---

### SCENE 3 — Buyer Flow: Catalog, Cart, Checkout (0:20 - 0:35)

Visuals (record in this order):
1. Browse the wholesale product catalog — use search bar (type a product name)
2. Add 2-3 products to cart — show cart badge counter increment
3. Open cart panel — show server-computed totals with Decimal precision
4. Hit "Place Order" — show success toast notification
5. Cut to My Orders tab — order appears with status PENDING

On-Screen Callout (add in editing):
"ACID Serializable Transaction | Atomic Stock Decrement | Zero Overselling"

Narration:
"Buyers browse real-time wholesale inventory, build a cart, and check out through a
PostgreSQL serializable transaction that atomically locks stock — completely eliminating
overselling race conditions."

---

### SCENE 4 — Admin: Fulfillment + PDF Invoice (0:35 - 0:50)

Visuals (record in this order):
1. Switch to Admin view — show orders dashboard with the pending order
2. Click Approve — status badge animates to APPROVED
3. Click Download Invoice PDF — PDF opens in browser, show corporate invoice layout
4. Click Cancel on another order — show inventory restocked in product catalog
5. Flash the Audit Logs tab — show timestamped immutable log entries

On-Screen Callout (add in editing):
"Multi-Stage Fulfillment | Auto PDF Invoice | Inventory Restock | Immutable Audit Trail"

Narration:
"Admins manage the full fulfillment lifecycle — approving triggers auto-generated PDF invoices,
while cancellations transactionally restock the warehouse. Every state change is written
to an immutable audit log."

---

### SCENE 5 — Code Quality and Outro (0:50 - 0:58)

Visuals (record in this order):
1. Quick 3-second VS Code pan over the /src folder showing key files
2. Flash the README.md with the Mermaid flowchart visible
3. Cut to GitHub repo: github.com/RasalaPraneeth2006/arrowstack-b2b-order-platform
4. Closing card: Your name | Arrowstack Full Stack Dev Internship | GitHub link

Narration:
"Full source on GitHub — NestJS backend with test suites, Next.js 15 frontend,
Dockerized infrastructure, and complete docs. Thank you Arrowstack!"

---

## LINKEDIN POST CAPTION (copy-paste ready)

Just completed my Full Stack Development Internship project at Arrowstack!

Built a production-grade B2B Wholesale Order Management Platform from scratch:

- JWT Auth + Bcrypt + Role-Based Access (Admin / Buyer)
- PostgreSQL ACID Serializable Checkout Transaction
- Real-time Inventory with Atomic Stock Decrement
- Auto-generated PDF Invoices on Order Approval
- Multi-stage Fulfillment: PENDING, APPROVED, SHIPPED, DELIVERED
- Immutable Audit Trail for every state change
- Fully Dockerized with Docker Compose
- Unit-tested NestJS backend

Tech Stack: Next.js 15, NestJS, PostgreSQL, Prisma ORM, Docker, JWT, TypeScript

GitHub: github.com/RasalaPraneeth2006/arrowstack-b2b-order-platform

Grateful for the hands-on challenge!

#Arrowstack #FullStackDevelopment #Internship #NestJS #NextJS #TypeScript #PostgreSQL #Docker #WebDevelopment

---

## RECORDING CHECKLIST

- Browser zoom at 100%, use F11 for fullscreen
- Resolution: 1920x1080 minimum
- Tool: OBS Studio or Loom
- Record at 60fps for smooth animations
- Keep mouse movements slow and deliberate
- Trim dead air, keep total under 60 seconds
- Add background lo-fi music at 15% volume in editing
- Export as MP4 H.264 for LinkedIn upload

---

## TIMING SUMMARY

Scene          | Time        | Key Action
---------------|-------------|--------------------------------------------------
Title Card     | 0:00 - 0:08 | Branded intro overlay
Auth and RBAC  | 0:08 - 0:20 | Login as Admin and Buyer, show role gates
Buyer Checkout | 0:20 - 0:35 | Search, Cart, ACID checkout, Order created
Admin+Invoice  | 0:35 - 0:50 | Approve, PDF download, Cancel+restock, Audit log
Code and Outro | 0:50 - 0:58 | VS Code pan, README, GitHub, closing card
