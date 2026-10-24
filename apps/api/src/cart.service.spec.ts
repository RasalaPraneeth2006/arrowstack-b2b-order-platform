import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CartService } from './cart.service';
import { PrismaService } from './prisma.service';

describe('CartService', () => {
  let service: CartService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      cartItem: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      product: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  describe('get', () => {
    it('should return cart items and calculate server total using Decimal arithmetic', async () => {
      prisma.cartItem.findMany.mockResolvedValue([
        {
          id: 'item-1',
          quantity: 2,
          product: {
            id: 'p1',
            name: 'Coffee',
            unitPrice: new Prisma.Decimal('50.00'),
          },
        },
        {
          id: 'item-2',
          quantity: 3,
          product: {
            id: 'p2',
            name: 'Paper',
            unitPrice: new Prisma.Decimal('20.00'),
          },
        },
      ]);

      const result = await service.get('user-1');
      expect(result.items).toHaveLength(2);
      expect(result.totalAmount).toBe('160.00'); // 2*50 + 3*20 = 160.00
      expect(result.itemCount).toBe(5);
    });
  });

  describe('add', () => {
    it('should add product to cart if sufficient stock exists', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'p1',
        name: 'Coffee',
        stockQuantity: 20,
      });
      prisma.cartItem.findUnique.mockResolvedValue(null);
      prisma.cartItem.upsert.mockResolvedValue({
        id: 'cart-1',
        productId: 'p1',
        quantity: 5,
      });

      const result = await service.add('user-1', 'p1', 5);
      expect(result.quantity).toBe(5);
    });

    it('should reject adding more quantity than available stock', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'p1',
        name: 'Coffee',
        stockQuantity: 10,
      });
      prisma.cartItem.findUnique.mockResolvedValue({ quantity: 8 });

      // Requesting 5 more when already 8 in cart and stock is only 10 (8+5 = 13 > 10)
      await expect(service.add('user-1', 'p1', 5)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if product is not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null);
      await expect(service.add('user-1', 'nonexistent', 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove and clear', () => {
    it('should remove existing cart item belonging to user', async () => {
      prisma.cartItem.findFirst.mockResolvedValue({ id: 'item-1', userId: 'user-1' });
      prisma.cartItem.delete.mockResolvedValue({ id: 'item-1' });

      const result = await service.remove('user-1', 'item-1');
      expect(result.ok).toBe(true);
    });

    it('should throw NotFoundException if removing non-owned or missing item', async () => {
      prisma.cartItem.findFirst.mockResolvedValue(null);
      await expect(service.remove('user-1', 'other-item')).rejects.toThrow(NotFoundException);
    });

    it('should clear all cart items for user', async () => {
      prisma.cartItem.deleteMany.mockResolvedValue({ count: 3 });
      const result = await service.clear('user-1');
      expect(result.cleared).toBe(true);
    });
  });
});
