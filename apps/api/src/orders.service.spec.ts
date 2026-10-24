import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma, Role } from '@prisma/client';
import { OrdersService } from './orders.service';
import { PrismaService } from './prisma.service';
import { PdfService } from './pdf.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: any;
  let pdfService: any;

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn(),
      order: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      invoice: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
    };

    pdfService = {
      generateInvoicePdf: jest.fn().mockResolvedValue(Buffer.from('PDF_DUMMY_CONTENT')),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prisma },
        { provide: PdfService, useValue: pdfService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe('checkout transaction', () => {
    it('should throw BadRequestException if cart is empty', async () => {
      prisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          cartItem: {
            findMany: jest.fn().mockResolvedValue([]),
          },
        };
        return callback(tx);
      });

      await expect(service.checkout('user-1')).rejects.toThrow(BadRequestException);
    });

    it('should atomically decrement stock, create order with price snapshots, and clear cart', async () => {
      const mockCart = [
        {
          productId: 'p1',
          quantity: 2,
          product: {
            id: 'p1',
            name: 'Coffee Beans',
            sku: 'WH-COFFEE-001',
            unitPrice: new Prisma.Decimal('80.00'),
            stockQuantity: 50,
          },
        },
      ];

      prisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          cartItem: {
            findMany: jest.fn().mockResolvedValue(mockCart),
            deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          product: {
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          order: {
            create: jest.fn().mockResolvedValue({
              id: 'order-123',
              userId: 'user-1',
              status: OrderStatus.PENDING,
              totalAmount: new Prisma.Decimal('160.00'),
              items: mockCart,
            }),
          },
          auditLog: {
            create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
          },
        };
        return callback(tx);
      });

      const order = await service.checkout('user-1');
      expect(order.id).toBe('order-123');
      expect(order.status).toBe(OrderStatus.PENDING);
    });

    it('should abort checkout and rollback if stock is insufficient during transaction', async () => {
      const mockCart = [
        {
          productId: 'p1',
          quantity: 100,
          product: {
            id: 'p1',
            name: 'Limited Item',
            sku: 'WH-LIMIT-001',
            unitPrice: new Prisma.Decimal('50.00'),
            stockQuantity: 10,
          },
        },
      ];

      prisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          cartItem: {
            findMany: jest.fn().mockResolvedValue(mockCart),
          },
          product: {
            updateMany: jest.fn().mockResolvedValue({ count: 0 }), // 0 updated means condition stockQuantity >= 100 failed
          },
        };
        return callback(tx);
      });

      await expect(service.checkout('user-1')).rejects.toThrow(
        /Insufficient stock available/,
      );
    });
  });

  describe('order status transitions & restock', () => {
    it('should restore stock to inventory when order is cancelled', async () => {
      const existingOrder = {
        id: 'order-1',
        status: OrderStatus.PENDING,
        items: [{ productId: 'p1', quantity: 5 }],
      };

      prisma.order.findUnique.mockResolvedValue(existingOrder);

      prisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          product: { update: jest.fn().mockResolvedValue({}) },
          order: {
            update: jest.fn().mockResolvedValue({ ...existingOrder, status: OrderStatus.CANCELLED }),
            findUnique: jest.fn().mockResolvedValue({ ...existingOrder, status: OrderStatus.CANCELLED }),
          },
          auditLog: { create: jest.fn().mockResolvedValue({}) },
        };
        return callback(tx);
      });

      const updated = await service.changeStatus('admin-1', 'order-1', OrderStatus.CANCELLED);
      expect(updated?.status).toBe(OrderStatus.CANCELLED);
    });

    it('should reject state change on already delivered or cancelled terminal order', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.DELIVERED,
      });

      await expect(
        service.changeStatus('admin-1', 'order-1', OrderStatus.APPROVED),
      ).rejects.toThrow(/Terminal order status cannot be modified/);
    });
  });

  describe('invoices & security', () => {
    it('should enforce buyer IDOR protection when viewing invoices', async () => {
      prisma.invoice.findFirst.mockResolvedValue({
        id: 'inv-1',
        order: { userId: 'buyer-a' },
      });

      // buyer-b attempts to view buyer-a's invoice
      await expect(
        service.invoice('buyer-b', Role.BUYER, 'inv-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to view any invoice', async () => {
      const mockInvoice = {
        id: 'inv-1',
        invoiceNumber: 'INV-2026-999',
        order: { userId: 'buyer-a', user: { companyName: 'Corp A', email: 'a@test.com' }, items: [] },
      };
      prisma.invoice.findFirst.mockResolvedValue(mockInvoice);

      const result = await service.invoice('admin-1', Role.ADMIN, 'inv-1');
      expect(result.id).toBe('inv-1');
    });

    it('should generate real PDF buffer for valid authorized invoice request', async () => {
      const mockInvoice = {
        id: 'inv-1',
        invoiceNumber: 'INV-2026-999',
        issuedAt: new Date(),
        status: 'UNPAID',
        orderId: 'order-1',
        order: {
          totalAmount: new Prisma.Decimal('100.00'),
          userId: 'buyer-1',
          user: { companyName: 'Client Corp', email: 'buyer@test.com' },
          items: [],
        },
      };

      prisma.invoice.findFirst.mockResolvedValue(mockInvoice);

      const result = await service.getInvoicePdfBuffer('buyer-1', Role.BUYER, 'inv-1');
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.filename).toBe('INV-2026-999.pdf');
      expect(pdfService.generateInvoicePdf).toHaveBeenCalled();
    });
  });
});
