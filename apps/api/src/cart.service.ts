import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly db: PrismaService) {}

  /**
   * Retrieve active cart for user with products and server-calculated total
   */
  async get(userId: string) {
    const items = await this.db.cartItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { updatedAt: 'desc' },
    });

    let total = new Prisma.Decimal(0);
    for (const item of items) {
      total = total.add(item.product.unitPrice.mul(item.quantity));
    }

    return {
      items,
      totalAmount: total.toFixed(2),
      itemCount: items.reduce((acc, i) => acc + i.quantity, 0),
    };
  }

  /**
   * Add quantity of product to cart
   */
  async add(userId: string, productId: string, quantity: number) {
    if (quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    const product = await this.db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existing = await this.db.cartItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    const newQuantity = (existing?.quantity || 0) + quantity;
    if (product.stockQuantity < newQuantity) {
      throw new BadRequestException(
        `Requested total quantity (${newQuantity}) exceeds available stock (${product.stockQuantity}) for ${product.name}`,
      );
    }

    return this.db.cartItem.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId, quantity },
      update: { quantity: newQuantity },
      include: { product: true },
    });
  }

  /**
   * Explicitly set quantity for an existing cart item
   */
  async updateQuantity(userId: string, cartItemId: string, quantity: number) {
    if (quantity < 1) {
      return this.remove(userId, cartItemId);
    }

    const item = await this.db.cartItem.findFirst({
      where: { id: cartItemId, userId },
      include: { product: true },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    if (item.product.stockQuantity < quantity) {
      throw new BadRequestException(
        `Requested quantity (${quantity}) exceeds available stock (${item.product.stockQuantity}) for ${item.product.name}`,
      );
    }

    return this.db.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: { product: true },
    });
  }

  /**
   * Remove a single cart item
   */
  async remove(userId: string, id: string) {
    const item = await this.db.cartItem.findFirst({
      where: { id, userId },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.db.cartItem.delete({
      where: { id },
    });

    return { ok: true, removedId: id };
  }

  /**
   * Clear all cart items for user
   */
  async clear(userId: string) {
    await this.db.cartItem.deleteMany({
      where: { userId },
    });
    return { ok: true, cleared: true };
  }
}
