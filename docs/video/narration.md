# Voiceover Narration Script
## Arrowstack B2B Order Management Platform Showcase

### Production Notes
- **Tone**: Professional, clear, confident, technical, pacing ~135 words per minute.
- **Audio Output**: 48 kHz AAC stereo, high-clarity voice track.

---

### Verbatim Narration Script

```text
[00:00 - 00:08]
"Hi everyone! This is my completed project for Arrowstack’s Full Stack Development Internship Task 1: an enterprise-grade B2B Order Management Platform."

[00:08 - 00:22]
"Business buyers can log into their wholesale workspace to explore real-time inventory. The catalog features instant search, case-tiered pricing, and live stock health badges indicating low inventory thresholds."

[00:22 - 00:38]
"When a buyer stages products into their cart, all totals are computed server-side using Decimal precision. Submitting an order initiates a PostgreSQL serializable transaction—atomically decrementing warehouse stock and locking inventory to guarantee zero overselling race conditions."

[00:38 - 00:52]
"The buyer immediately receives an immutable order confirmation with live status tracking, line-item historical price snapshots, and fulfillment timelines."

[00:52 - 01:10]
"Switching over to the Administrator console, we see real-time KPI metrics tracking wholesale revenue, active orders, and low-stock alerts. Approving a pending order automatically triggers our invoice generation engine, while cancelling an order transactionally restores the reserved stock back to the warehouse."

[01:10 - 01:25]
"With one click, both buyers and admins can download a dynamically generated corporate PDF invoice complete with corporate headers, itemized breakdowns, and payment terms. Plus, every state mutation is recorded in an audit trail for strict compliance."

[01:25 - 01:35]
"The entire platform is built with Next.js 15 App Router, NestJS, PostgreSQL, Prisma ORM, and Docker, backed by 29 automated test suites. Check out the link below for the code and architecture details. Thank you!"
```
