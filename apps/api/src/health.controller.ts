import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from './prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'System and database readiness health check' })
  async check() {
    let dbStatus = 'disconnected';
    let dbError = null;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (err: any) {
      dbStatus = 'error';
      dbError = err.message;
    }

    const health = {
      status: dbStatus === 'connected' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: {
          status: dbStatus,
          provider: 'PostgreSQL',
          error: dbError,
        },
        api: {
          status: 'running',
          version: '1.0.0',
        },
      },
    };

    if (dbStatus !== 'connected') {
      // In degraded mode, return 200 with degraded state or 503 if strictly required
      // Keeping 200 with status: degraded allows external probes to inspect the detailed error
    }

    return health;
  }
}
