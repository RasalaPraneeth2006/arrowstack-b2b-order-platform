import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaService } from './prisma.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      product: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('list', () => {
    it('should return products list without search filter', async () => {
      prisma.product.findMany.mockResolvedValue([
        { id: 'p1', sku: 'SKU1', name: 'Product 1' },
      ]);

      const result = await service.list();
      expect(result).toHaveLength(1);
      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { name: 'asc' },
      });
    });

    it('should query with case-insensitive search filter', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      await service.list('coffee');

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'coffee', mode: 'insensitive' } },
            { sku: { contains: 'coffee', mode: 'insensitive' } },
            { description: { contains: 'coffee', mode: 'insensitive' } },
          ],
        },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('create', () => {
    it('should create product when SKU is unique and price/stock are valid', async () => {
      prisma.product.findUnique.mockResolvedValue(null);
      prisma.product.create.mockImplementation(({ data }: any) =>
        Promise.resolve({ id: 'p-new', ...data }),
      );

      const result = await service.create({
        sku: 'wh-test-01',
        name: 'Test Product',
        description: 'Quality wholesale sample',
        unitPrice: 50.0,
        stockQuantity: 100,
      });

      expect(result.sku).toBe('WH-TEST-01');
      expect(prisma.product.create).toHaveBeenCalled();
    });

    it('should throw ConflictException on duplicate SKU', async () => {
      prisma.product.findUnique.mockResolvedValue({ id: 'existing', sku: 'WH-TEST-01' });

      await expect(
        service.create({
          sku: 'WH-TEST-01',
          name: 'Another item',
          unitPrice: 10,
          stockQuantity: 5,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if price is <= 0', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          sku: 'WH-INVALID-PRICE',
          name: 'Zero price item',
          unitPrice: 0,
          stockQuantity: 10,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if stock is negative', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          sku: 'WH-INVALID-STOCK',
          name: 'Negative stock item',
          unitPrice: 20,
          stockQuantity: -5,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('stock adjustment', () => {
    it('should update stock level successfully', async () => {
      prisma.product.update.mockResolvedValue({ id: 'p1', stockQuantity: 45 });

      const result = await service.stock('p1', 45);
      expect(result.stockQuantity).toBe(45);
    });

    it('should reject negative stock levels', async () => {
      await expect(service.stock('p1', -1)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      prisma.product.update.mockRejectedValue(new Error('Record not found'));
      await expect(service.stock('p-nonexistent', 10)).rejects.toThrow(NotFoundException);
    });
  });
});
