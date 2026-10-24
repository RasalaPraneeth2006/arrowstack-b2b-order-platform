import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private readonly db: PrismaService) {}

  async list(limit = 50) {
    return this.db.auditLog.findMany({
      take: Math.min(limit, 100),
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            companyName: true,
            role: true,
          },
        },
      },
    });
  }
}
