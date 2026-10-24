import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';
import { Request } from 'express';
import { JwtGuard, Roles, RolesGuard } from './security';
import { CartService } from './cart.service';

class AddItemDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

class UpdateItemDto {
  @IsInt()
  @Min(1)
  quantity: number;
}

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtGuard, RolesGuard)
@Roles('BUYER')
export class CartController {
  constructor(private readonly service: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current buyer cart with itemized products and server totals' })
  get(@Req() req: Request & { user: any }) {
    return this.service.get(req.user.sub);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add product to cart or increment quantity' })
  add(@Req() req: Request & { user: any }, @Body() dto: AddItemDto) {
    return this.service.add(req.user.sub, dto.productId, dto.quantity);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update quantity of specific cart line item' })
  update(
    @Req() req: Request & { user: any },
    @Param('id') id: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.service.updateQuantity(req.user.sub, id, dto.quantity);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove item from cart' })
  remove(@Req() req: Request & { user: any }, @Param('id') id: string) {
    return this.service.remove(req.user.sub, id);
  }

  @Delete()
  @ApiOperation({ summary: 'Empty entire cart' })
  clear(@Req() req: Request & { user: any }) {
    return this.service.clear(req.user.sub);
  }
}
