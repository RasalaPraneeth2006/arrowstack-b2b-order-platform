import { PrismaClient, Role, OrderStatus, InvoiceStatus, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Arrowstack wholesale database...');

  // 1. Seed Users
  const adminHash = await bcrypt.hash('Admin123!ChangeMe', 12);
  const buyerHash = await bcrypt.hash('Buyer123!ChangeMe', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@arrowstack.local' },
    update: {
      passwordHash: adminHash,
      companyName: 'Arrowstack Wholesale HQ',
      role: Role.ADMIN,
    },
    create: {
      email: 'admin@arrowstack.local',
      passwordHash: adminHash,
      role: Role.ADMIN,
      companyName: 'Arrowstack Wholesale HQ',
    },
  });

  const buyer1 = await prisma.user.upsert({
    where: { email: 'buyer@arrowstack.local' },
    update: {
      passwordHash: buyerHash,
      companyName: 'Demo Retail Co.',
      role: Role.BUYER,
    },
    create: {
      email: 'buyer@arrowstack.local',
      passwordHash: buyerHash,
      role: Role.BUYER,
      companyName: 'Demo Retail Co.',
    },
  });

  const buyer2 = await prisma.user.upsert({
    where: { email: 'buyer2@arrowstack.local' },
    update: {
      passwordHash: buyerHash,
      companyName: 'Metro Cafe & Roastery',
      role: Role.BUYER,
    },
    create: {
      email: 'buyer2@arrowstack.local',
      passwordHash: buyerHash,
      role: Role.BUYER,
      companyName: 'Metro Cafe & Roastery',
    },
  });

  // 2. Seed Products
  const productsData = [
    {
      sku: 'WH-COFFEE-001',
      name: 'Single-Origin Arabica Espresso Beans (5 kg)',
      description: 'Artisan roasted wholesale whole bean coffee bag for commercial espresso machines.',
      unitPrice: new Prisma.Decimal('84.50'),
      stockQuantity: 120,
    },
    {
      sku: 'WH-PAPER-002',
      name: 'Commercial A4 Copy Paper Carton (5 reams)',
      description: '80 GSM multi-purpose ultra-bright office copier paper, 2500 sheets total.',
      unitPrice: new Prisma.Decimal('24.00'),
      stockQuantity: 215,
    },
    {
      sku: 'WH-BOX-003',
      name: 'Heavy-Duty Corrugated Shipping Boxes (100 pack)',
      description: 'Double-walled recyclable packing boxes, 14x10x6 inches.',
      unitPrice: new Prisma.Decimal('42.00'),
      stockQuantity: 65,
    },
    {
      sku: 'WH-GLOVE-004',
      name: 'Industrial Nitrile Examination Gloves (10-box Case)',
      description: 'Powder-free, chemical resistant, food-grade blue nitrile gloves (1,000 count).',
      unitPrice: new Prisma.Decimal('58.00'),
      stockQuantity: 4, // Intentionally low stock to demonstrate low-stock badge
    },
    {
      sku: 'WH-TAPE-005',
      name: 'Reinforced Packaging Tape (36 rolls)',
      description: 'High-adhesion acrylic sealing tape for warehouse and carton shipping.',
      unitPrice: new Prisma.Decimal('36.50'),
      stockQuantity: 90,
    },
    {
      sku: 'WH-CLEAN-006',
      name: 'Multi-Surface Sanitizer Concentrate (4x1 Gal)',
      description: 'Hospital-grade disinfectant concentrate with dilution metering.',
      unitPrice: new Prisma.Decimal('72.00'),
      stockQuantity: 40,
    },
  ];

  const createdProducts: Record<string, any> = {};
  for (const p of productsData) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        description: p.description,
        unitPrice: p.unitPrice,
        stockQuantity: p.stockQuantity,
      },
      create: p,
    });
    createdProducts[p.sku] = product;
  }

  // 3. Seed Sample Orders and Invoices if none exist
  const existingOrders = await prisma.order.count();
  if (existingOrders === 0) {
    // Order 1: APPROVED with Invoice
    const order1Items = [
      {
        productId: createdProducts['WH-COFFEE-001'].id,
        quantity: 2,
        unitPrice: new Prisma.Decimal('84.50'),
      },
      {
        productId: createdProducts['WH-BOX-003'].id,
        quantity: 1,
        unitPrice: new Prisma.Decimal('42.00'),
      },
    ];
    const order1Total = new Prisma.Decimal('211.00');

    const order1 = await prisma.order.create({
      data: {
        userId: buyer1.id,
        status: OrderStatus.APPROVED,
        totalAmount: order1Total,
        items: {
          create: order1Items,
        },
        invoice: {
          create: {
            invoiceNumber: 'INV-2026-00101',
            status: InvoiceStatus.UNPAID,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: buyer1.id,
        action: 'ORDER_CREATED',
        entityType: 'Order',
        entityId: order1.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'ORDER_STATUS_APPROVED',
        entityType: 'Order',
        entityId: order1.id,
      },
    });

    // Order 2: SHIPPED with Invoice
    const order2 = await prisma.order.create({
      data: {
        userId: buyer2.id,
        status: OrderStatus.SHIPPED,
        totalAmount: new Prisma.Decimal('169.00'),
        items: {
          create: [
            {
              productId: createdProducts['WH-COFFEE-001'].id,
              quantity: 2,
              unitPrice: new Prisma.Decimal('84.50'),
            },
          ],
        },
        invoice: {
          create: {
            invoiceNumber: 'INV-2026-00102',
            status: InvoiceStatus.PAID,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'ORDER_STATUS_SHIPPED',
        entityType: 'Order',
        entityId: order2.id,
      },
    });
  }

  console.log('Seeding completed successfully: users, products, orders, invoices, and audit logs created.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
