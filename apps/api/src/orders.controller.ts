import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderStatus } from '@prisma/client';
import { Request, Response } from 'express';
import { JwtGuard, Roles, RolesGuard } from './security';
import { OrdersService } from './orders.service';

class StatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List orders (scoped to buyer or all for admin)' })
  list(@Req() req: Request & { user: any }) {
    return this.service.list(req.user.sub, req.user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details by ID' })
  getById(@Req() req: Request & { user: any }, @Param('id') id: string) {
    return this.service.getById(req.user.sub, req.user.role, id);
  }

  @Post()
  @Roles('BUYER')
  @ApiOperation({ summary: 'Execute transactional checkout from cart' })
  create(@Req() req: Request & { user: any }) {
    return this.service.checkout(req.user.sub);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update order fulfillment status (Admin only)' })
  status(
    @Req() req: Request & { user: any },
    @Param('id') id: string,
    @Body() dto: StatusDto,
  ) {
    return this.service.changeStatus(req.user.sub, id, dto.status);
  }
}

@ApiTags('Invoices')
@Controller('invoices')
@UseGuards(JwtGuard)
export class InvoicesController {
  constructor(private readonly service: OrdersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice metadata by ID or Order ID' })
  get(@Req() req: Request & { user: any }, @Param('id') id: string) {
    return this.service.invoice(req.user.sub, req.user.role, id);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Stream downloadable invoice PDF document' })
  async getPdf(
    @Req() req: Request & { user: any },
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const { buffer, filename } = await this.service.getInvoicePdfBuffer(
      req.user.sub,
      req.user.role,
      id,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Direct attachment download for invoice PDF' })
  async downloadPdf(
    @Req() req: Request & { user: any },
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const { buffer, filename } = await this.service.getInvoicePdfBuffer(
      req.user.sub,
      req.user.role,
      id,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
