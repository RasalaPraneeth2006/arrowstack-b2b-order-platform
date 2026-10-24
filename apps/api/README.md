# Arrowstack API (apps/api)

NestJS modular backend service for the Arrowstack B2B Order Management Platform.

## Modules & Architecture
- `auth`: Registration, credential verification, bcrypt hashing, JWT issuance in HTTP-only cookies, session validation (`/api/v1/auth`).
- `products`: Wholesale catalog queries, search filtering, inventory stock updates, SKU management (`/api/v1/products`).
- `cart`: User-scoped cart persistence, quantity increments, live stock checks (`/api/v1/cart`).
- `orders`: Serializable ACID checkout, atomic inventory decrement, fulfillment status transitions, automatic restocking on cancellation (`/api/v1/orders`).
- `invoices`: Dynamic PDF invoice generation with PDFKit, invoice metadata retrieval, secure stream downloads (`/api/v1/invoices`).
- `audit-logs`: Administrative event logging and compliance audit trail (`/api/v1/audit-logs`).
- `health`: Service and database connectivity health probe (`/api/v1/health`).

## Application Flow
Refer to the complete Application Flow diagrams and sequence charts in the [Root README](../../README.md#1-application-flow--system-architecture).
