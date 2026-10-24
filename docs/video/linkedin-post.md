# LinkedIn Showcase Post Draft

**Subject:** Arrowstack Full Stack Development Internship — Task 1 Completion & Architecture Breakdown

---

### Post Content

🚀 Excited to share my completed project for **Task 1 of the Arrowstack Full Stack Development Internship**: a containerized **B2B Wholesale Order Management & Inventory Platform**.

### 💼 The Business Challenge
In wholesale B2B commerce, order transactions involve bulk quantities, multi-tier pricing, and concurrent business buyers. Standard naive checkout workflows often suffer from race conditions—risking overselling inventory when multiple buyers check out limited stock simultaneously.

### 🛠️ Key Technical Highlights
Here is how I designed and engineered the platform from end to end:

1. **ACID Transactional Checkout Core:**
   Implemented checkout using PostgreSQL `Serializable` transaction isolation via Prisma ORM. When a buyer checks out, row-level product locks re-verify available inventory, snapshot historical unit prices, decrement stock atomically, flush the cart, and commit the order—guaranteeing 100% race-condition immunity.

2. **Automated Restocking on Cancellation:**
   If an administrator cancels an active order, a transactional rollback safely restores the reserved quantities back into inventory, preventing double-restocking through state machine validation and immutable audit logs.

3. **Dynamic PDF Tax Invoicing:**
   Integrated an automated PDF generation service using PDFKit. When an order transitions to `APPROVED`, an official invoice record is created with a unique sequence number, streaming a printable corporate PDF invoice on-demand to both buyers and administrators.

4. **Robust Role-Based Access Control (RBAC):**
   Stateless JWT authentication stored in HTTP-only, `SameSite=Lax` cookies with server-side `@Roles()` guards in NestJS, ensuring zero cross-company data leakage (IDOR protection).

5. **Clean Monorepo & UI/UX:**
   Built with Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, and Lucide Icons—featuring live KPI analytics, inventory threshold badges, and interactive fulfillment controls.

6. **Quality & Containerization:**
   Engineered a full test suite with 29 automated unit and integration tests across auth, catalog, cart, checkout transactions, and invoicing, containerized via Docker Compose with health checks.

### 💡 Key Takeaway
Building this platform deepened my understanding of database transaction isolation levels, concurrency control, and the critical importance of keeping financial calculations strictly server-side using Decimal precision rather than client-supplied inputs.

Check out the full walkthrough video below! I would love to hear feedback or thoughts from fellow engineers.

---

#FullStackDevelopment #SoftwareEngineering #NextJS #NestJS #PostgreSQL #TypeScript #WebDevelopment #Docker #Prisma
