# Screen Recording & Production Checklist
## Arrowstack B2B Order Management Platform

Follow this checklist before hitting record to ensure a crisp, high-impact presentation.

### 1. Environment Preparation
- [ ] Screen resolution set to **1920 × 1080** (or **1080 × 1920** vertical if recording mobile-format TikTok/Reels).
- [ ] Browser zoom set to **100%** or **110%** for maximum legibility of typography and badges.
- [ ] Clean browser profile with bookmark bar hidden, extensions disabled, and notifications muted.
- [ ] Local database seeded with sample data (`npm run seed` in `apps/api`).
- [ ] Backend running on `http://localhost:4000/api/v1` and Frontend on `http://localhost:3000`.

### 2. Action Sequence Rehearsal
1. **Unauthenticated View**:
   - Show clean landing hero with B2B value proposition.
   - Click "Buyer: Demo Retail Co." quick credential button $\rightarrow$ click "Sign In".
2. **Wholesale Catalog Interaction**:
   - Type "Paper" or "Coffee" in search input to show dynamic filtering.
   - Highlight the low-stock indicator on Nitrile Gloves ("Only 4 left").
   - Click `+` on Single-Origin Arabica to select 2 units $\rightarrow$ click "Add".
3. **Cart & Transaction Checkout**:
   - Click Cart icon in navigation bar.
   - Show line item table with quantity stepper.
   - Click "Confirm & Place Order" $\rightarrow$ observe brief spinner and instant confirmation banner.
4. **Orders & Status**:
   - Show the newly placed order in `PENDING` status.
5. **Admin Console & Fulfillment**:
   - Click "Sign out" $\rightarrow$ click "Admin: Arrowstack HQ" quick button $\rightarrow$ "Sign In".
   - Highlight the KPI cards (Revenue, Active Orders, Low Stock Alerts).
   - In Orders tab, change order status from `PENDING` to `APPROVED`.
   - Show how the invoice button immediately renders with `INV-2026-XXXXX`.
6. **PDF Download**:
   - Click the invoice download button.
   - Preview the crisp, branded PDF document with line items, company info, and Net 30 payment terms.
7. **Audit Trail**:
   - Switch to "Audit Trail" tab to show real-time entries for `ORDER_CREATED` and `ORDER_STATUS_APPROVED`.

### 3. Video Capture Specifications
- **Framerate**: 60 FPS (preferred) or 30 FPS.
- **Bitrate**: 12–16 Mbps H.264 MP4.
- **Audio Track**: Clear vocal track normalized to -14 LUFS with gentle compression.
- **Cursor**: Visible with subtle click animations enabled (in OBS or Screen Studio).
