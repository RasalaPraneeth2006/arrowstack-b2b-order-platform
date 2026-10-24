import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InvoiceStatus, OrderStatus, Prisma, Role } from '@prisma/client';
import { PrismaService } from './prisma.service';
import { PdfService } from './pdf.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly db: PrismaService,
    private readonly pdfService: PdfService,
  ) {}

  /**
   * Serializable ACID Checkout Transaction
   * Locks inventory, validates stock, snapshots historical unit prices,
   * creates the order, flushes user cart, and writes an audit log.
   */
  async checkout(userId: string) {
    return this.db.$transaction(
      async (tx) => {
        // 1. Fetch active cart items with product details
        const cart = await tx.cartItem.findMany({
          where: { userId },
          include: { product: true },
        });

        if (!cart.length) {
          throw new BadRequestException('Your cart is empty. Please add items before checking out.');
        }

        let total = new Prisma.Decimal(0);

        // 2. Validate and atomically decrement stock for all items
        for (const item of cart) {
          if (item.quantity < 1) {
            throw new BadRequestException(`Invalid quantity for ${item.product.name}`);
          }

          const updated = await tx.product.updateMany({
            where: {
              id: item.productId,
              stockQuantity: { gte: item.quantity },
            },
            data: {
              stockQuantity: { decrement: item.quantity },
            },
          });

          if (updated.count !== 1) {
            throw new BadRequestException(
              `Insufficient stock available for "${item.product.name}" (SKU: ${item.product.sku}). Available: ${item.product.stockQuantity}, Requested: ${item.quantity}`,
            );
          }

          // Multiply unit price by quantity using Decimal arithmetic
          const lineTotal = item.product.unitPrice.mul(item.quantity);
          total = total.add(lineTotal);
        }

        // 3. Create Order with snapshot OrderItems
        const order = await tx.order.create({
          data: {
            userId,
            status: OrderStatus.PENDING,
            totalAmount: total,
            items: {
              create: cart.map((i) => ({
                productId: i.productId,
                quantity: i.quantity,
                unitPrice: i.product.unitPrice, // Historical price snapshot
              })),
            },
          },
          include: {
            items: {
              include: { product: true },
            },
            user: {
              select: {
                id: true,
                email: true,
                companyName: true,
              },
            },
          },
        });

        // 4. Clear buyer's cart
        await tx.cartItem.deleteMany({
          where: { userId },
        });

        // 5. Create immutable audit log
        await tx.auditLog.create({
          data: {
            userId,
            action: 'ORDER_CREATED',
            entityType: 'Order',
            entityId: order.id,
          },
        });

        return order;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  /**
   * List orders with RBAC scoping
   */
  async list(userId: string, role: string) {
    const whereClause: Prisma.OrderWhereInput =
      role === Role.ADMIN ? {} : { userId };

    return this.db.order.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            companyName: true,
          },
        },
        items: {
          include: { product: true },
        },
        invoice: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get single order details with ownership verification
   */
  async getById(userId: string, role: string, id: string) {
    const order = await this.db.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            companyName: true,
          },
        },
        items: {
          include: { product: true },
        },
        invoice: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (role !== Role.ADMIN && order.userId !== userId) {
      throw new ForbiddenException('Access denied: You cannot view orders placed by other companies');
    }

    return order;
  }

  /**
   * Order status transition with automatic restock on CANCELLED
   * and automatic Invoice generation on APPROVED.
   */
  async changeStatus(actorId: string, id: string, newStatus: OrderStatus) {
    const order = await this.db.order.findUnique({
      where: { id },
      include: { items: true, invoice: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException(
        `Terminal order status cannot be modified (current status: ${order.status})`,
      );
    }

    if (order.status === newStatus) {
      return order; // Idempotent no-op
    }

    return this.db.$transaction(async (tx) => {
      // 1. If cancelling an active order, restore reserved inventory to stock
      if (newStatus === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: { increment: item.quantity },
            },
          });
        }

        await tx.auditLog.create({
          data: {
            userId: actorId,
            action: 'ORDER_RESTOCKED_ON_CANCEL',
            entityType: 'Order',
            entityId: id,
          },
        });
      }

      // 2. Update order status
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status: newStatus },
        include: { items: true, invoice: true },
      });

      // 3. If APPROVED and invoice doesn't exist, create official invoice
      if (newStatus === OrderStatus.APPROVED && !updatedOrder.invoice) {
        const year = new Date().getFullYear();
        const rand = Math.floor(10000 + Math.random() * 90000);
        const invoiceNumber = `INV-${year}-${rand}`;

        await tx.invoice.create({
          data: {
            orderId: id,
            invoiceNumber,
            status: InvoiceStatus.UNPAID,
            pdfUrl: `/api/v1/invoices/${id}/pdf`,
          },
        });
      }

      // 4. Record audit log for status mutation
      await tx.auditLog.create({
        data: {
          userId: actorId,
          action: `ORDER_STATUS_${newStatus}`,
          entityType: 'Order',
          entityId: id,
        },
      });

      return tx.order.findUnique({
        where: { id },
        include: {
          items: { include: { product: true } },
          invoice: true,
          user: {
            select: { id: true, email: true, companyName: true },
          },
        },
      });
    });
  }

  /**
   * Fetch invoice details with authorization check
   */
  async invoice(userId: string, role: string, idOrOrderId: string) {
    const invoice = await this.db.invoice.findFirst({
      where: {
        OR: [{ id: idOrOrderId }, { orderId: idOrOrderId }],
      },
      include: {
        order: {
          include: {
            user: { select: { id: true, email: true, companyName: true } },
            items: { include: { product: true } },
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (role !== Role.ADMIN && invoice.order.userId !== userId) {
      throw new ForbiddenException('Access denied to requested invoice');
    }

    return invoice;
  }

  /**
   * Generate downloadable PDF buffer for an invoice
   */
  async getInvoicePdfBuffer(userId: string, role: string, idOrOrderId: string): Promise<{ buffer: Buffer; filename: string }> {
    const invoice = await this.invoice(userId, role, idOrOrderId);

    const pdfData = {
      invoiceNumber: invoice.invoiceNumber,
      issuedAt: invoice.issuedAt,
      status: invoice.status,
      orderId: invoice.orderId,
      companyName: invoice.order.user.companyName,
      email: invoice.order.user.email,
      items: invoice.order.items.map((i) => ({
        productName: i.product.name,
        sku: i.product.sku,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        subtotal: Number(i.unitPrice) * i.quantity,
      })),
      totalAmount: Number(invoice.order.totalAmount),
    };

    const buffer = await this.pdfService.generateInvoicePdf(pdfData);
    const filename = `${invoice.invoiceNumber}.pdf`;

    return { buffer, filename };
  }
}
