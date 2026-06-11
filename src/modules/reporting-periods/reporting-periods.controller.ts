import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiResponse,
  successResponse,
} from '../../common/interfaces/api-response.interface';
import { CreateReportingPeriodDto } from './dto/create-reporting-period.dto';
import { QueryReportingPeriodDto } from './dto/query-reporting-period.dto';
import { UpdateReportingPeriodDto } from './dto/update-reporting-period.dto';
import { ReportingPeriod } from './entities/reporting-period.entity';
import { ReportingPeriodsService } from './reporting-periods.service';

@Controller('reporting-periods')
export class ReportingPeriodsController {
  constructor(
    private readonly reportingPeriodsService: ReportingPeriodsService,
  ) {}

  @Get()
  async findAll(
    @Query() query: QueryReportingPeriodDto,
  ): Promise<ApiResponse<ReportingPeriod[]>> {
    const result = await this.reportingPeriodsService.findAll(query);

    return successResponse(result.items, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    });
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<ReportingPeriod>> {
    return successResponse(await this.reportingPeriodsService.findOne(id));
  }

  @Post()
  async create(
    @Body() dto: CreateReportingPeriodDto,
  ): Promise<ApiResponse<ReportingPeriod>> {
    return successResponse(await this.reportingPeriodsService.create(dto));
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReportingPeriodDto,
  ): Promise<ApiResponse<ReportingPeriod>> {
    return successResponse(await this.reportingPeriodsService.update(id, dto));
  }

  @Patch(':id/lock')
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<ReportingPeriod>> {
    return successResponse(await this.reportingPeriodsService.lock(id));
  }

  @Patch(':id/unlock')
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<ReportingPeriod>> {
    return successResponse(await this.reportingPeriodsService.unlock(id));
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<ReportingPeriod>> {
    return successResponse(await this.reportingPeriodsService.delete(id));
  }
}
