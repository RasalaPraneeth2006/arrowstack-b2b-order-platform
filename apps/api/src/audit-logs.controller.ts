import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtGuard, Roles, RolesGuard } from './security';
import { AuditLogsService } from './audit-logs.service';

@ApiTags('Audit Logs')
@Controller('audit-logs')
@UseGuards(JwtGuard, RolesGuard)
@Roles('ADMIN')
export class AuditLogsController {
  constructor(private readonly service: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'List recent administrative and transactional audit logs (Admin only)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of logs to retrieve' })
  list(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.service.list(isNaN(parsedLimit) ? 50 : parsedLimit);
  }
}
