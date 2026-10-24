import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

export interface CreateProductInput {
  sku: string;
  name: string;
  description?: string;
  unitPrice: number;
  stockQuantity: number;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  unitPrice?: number;
  stockQuantity?: number;
}

@Injectable()
export class ProductsService {
  constructor(private readonly db: PrismaService) {}

  /**
   * List all products with optional text search on name, SKU, or description
   */
  async list(search?: string) {
    const where: Prisma.ProductWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    return this.db.product.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Find a single product by ID
   */
  async getById(id: string) {
    const product = await this.db.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(`Product not found`);
    }
    return product;
  }

  /**
   * Create a new wholesale product SKU (Admin only)
   */
  async create(data: CreateProductInput) {
    const existing = await this.db.product.findUnique({
      where: { sku: data.sku.trim().toUpperCase() },
    });

    if (existing) {
      throw new ConflictException(`Product with SKU "${data.sku}" already exists`);
    }

    if (data.unitPrice <= 0) {
      throw new BadRequestException('Unit price must be greater than zero');
    }

    if (data.stockQuantity < 0) {
      throw new BadRequestException('Stock quantity cannot be negative');
    }

    return this.db.product.create({
      data: {
        sku: data.sku.trim().toUpperCase(),
        name: data.name.trim(),
        description: data.description?.trim() || '',
        unitPrice: new Prisma.Decimal(data.unitPrice.toFixed(2)),
        stockQuantity: Math.floor(data.stockQuantity),
      },
    });
  }

  /**
   * Adjust available inventory stock (Admin only)
   */
  async stock(id: string, stockQuantity: number) {
    if (stockQuantity < 0) {
      throw new BadRequestException('Stock quantity cannot be negative');
    }

    try {
      return await this.db.product.update({
        where: { id },
        data: { stockQuantity: Math.floor(stockQuantity) },
      });
    } catch {
      throw new NotFoundException('Product not found');
    }
  }

  /**
   * Update product metadata (Admin only)
   */
  async update(id: string, data: UpdateProductInput) {
    await this.getById(id);

    const updateData: Prisma.ProductUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.description !== undefined) updateData.description = data.description.trim();
    if (data.unitPrice !== undefined) {
      if (data.unitPrice <= 0) throw new BadRequestException('Unit price must be positive');
      updateData.unitPrice = new Prisma.Decimal(data.unitPrice.toFixed(2));
    }
    if (data.stockQuantity !== undefined) {
      if (data.stockQuantity < 0) throw new BadRequestException('Stock quantity cannot be negative');
      updateData.stockQuantity = Math.floor(data.stockQuantity);
    }

    return this.db.product.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete product (Admin only)
   */
  async delete(id: string) {
    await this.getById(id);
    return this.db.product.delete({
      where: { id },
    });
  }
}
