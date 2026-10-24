import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { ProductsService } from './products.service';
import { JwtGuard, Roles, RolesGuard } from './security';

class CreateProductDto {
  @IsString()
  @MinLength(2)
  sku: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0.01)
  unitPrice: number;

  @IsInt()
  @Min(0)
  stockQuantity: number;
}

class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  unitPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stockQuantity?: number;
}

class StockDto {
  @IsInt()
  @Min(0)
  stockQuantity: number;
}

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Browse wholesale product catalog with optional search' })
  @ApiQuery({ name: 'search', required: false, description: 'Search query for name, SKU, or description' })
  list(@Query('search') search?: string) {
    return this.service.list(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product details by ID' })
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new wholesale product SKU (Admin only)' })
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Patch(':id/stock')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update product stock level (Admin only)' })
  stock(@Param('id') id: string, @Body() dto: StockDto) {
    return this.service.stock(id, dto.stockQuantity);
  }

  @Put(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update product information (Admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete product SKU (Admin only)' })
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
