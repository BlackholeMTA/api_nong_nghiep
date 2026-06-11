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
import {
  DashboardIndicatorResult,
  DashboardService,
  DashboardSummary,
  DashboardSummaryResult,
} from './dashboard.service';
import { CreateDashboardIndicatorDto } from './dto/create-dashboard-indicator.dto';
import { QueryDashboardIndicatorDto } from './dto/query-dashboard-indicator.dto';
import { QueryDashboardSummaryDto } from './dto/query-dashboard-summary.dto';
import { UpdateDashboardIndicatorDto } from './dto/update-dashboard-indicator.dto';
import { DashboardMetric } from './entities/dashboard-metric.entity';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('indicators')
  async findIndicators(
    @Query() query: QueryDashboardIndicatorDto,
  ): Promise<ApiResponse<DashboardMetric[]>> {
    const result: DashboardIndicatorResult =
      await this.dashboardService.findIndicators(query);

    return successResponse(result.items, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    });
  }

  @Post('indicators')
  async createIndicator(
    @Body() dto: CreateDashboardIndicatorDto,
  ): Promise<ApiResponse<DashboardMetric>> {
    return successResponse(await this.dashboardService.createIndicator(dto));
  }

  @Patch('indicators/:id')
  async updateIndicator(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDashboardIndicatorDto,
  ): Promise<ApiResponse<DashboardMetric>> {
    return successResponse(
      await this.dashboardService.updateIndicator(id, dto),
    );
  }

  @Delete('indicators/:id')
  async deleteIndicator(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<DashboardMetric>> {
    return successResponse(await this.dashboardService.deleteIndicator(id));
  }

  @Get('summary')
  async getSummary(
    @Query() query: QueryDashboardSummaryDto,
  ): Promise<ApiResponse<DashboardSummary[]>> {
    const result: DashboardSummaryResult =
      await this.dashboardService.getSummary(query);

    return successResponse(result.items, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    });
  }
}
