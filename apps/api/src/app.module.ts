import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { OrdersController, InvoicesController } from './orders.controller';
import { OrdersService } from './orders.service';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLogsService } from './audit-logs.service';
import { HealthController } from './health.controller';
import { PdfService } from './pdf.service';
import { JwtGuard, RolesGuard } from './security';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({}),
  ],
  controllers: [
    AuthController,
    ProductsController,
    CartController,
    OrdersController,
    InvoicesController,
    AuditLogsController,
    HealthController,
  ],
  providers: [
    PrismaService,
    AuthService,
    ProductsService,
    CartService,
    OrdersService,
    AuditLogsService,
    PdfService,
    JwtGuard,
    RolesGuard,
  ],
})
export class AppModule {}
