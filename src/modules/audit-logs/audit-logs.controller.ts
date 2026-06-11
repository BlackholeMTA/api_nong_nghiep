import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiResponse,
  successResponse,
} from '../../common/interfaces/api-response.interface';
import { AuditLogsService } from './audit-logs.service';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';
import { AuditLog } from './entities/audit-log.entity';

@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  async findAll(
    @Query() query: QueryAuditLogDto,
  ): Promise<ApiResponse<AuditLog[]>> {
    const result = await this.auditLogsService.findAll(query);

    return successResponse(result.items, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    });
  }
}
