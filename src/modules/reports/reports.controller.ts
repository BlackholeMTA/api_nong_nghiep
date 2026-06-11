import {
  Body,
  Controller,
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
import { ApproveReportDto } from './dto/approve-report.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { QueryReportDto } from './dto/query-report.dto';
import { RejectReportDto } from './dto/reject-report.dto';
import { SubmitReportDto } from './dto/submit-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Report } from './entities/report.entity';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  async findAll(
    @Query() query: QueryReportDto,
  ): Promise<ApiResponse<Report[]>> {
    const result = await this.reportsService.findAll(query);

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
  ): Promise<ApiResponse<Report>> {
    return successResponse(await this.reportsService.findOne(id));
  }

  @Post()
  async create(@Body() dto: CreateReportDto): Promise<ApiResponse<Report>> {
    return successResponse(await this.reportsService.create(dto));
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReportDto,
  ): Promise<ApiResponse<Report>> {
    return successResponse(await this.reportsService.update(id, dto));
  }

  @Patch(':id/submit')
  async submit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubmitReportDto,
  ): Promise<ApiResponse<Report>> {
    return successResponse(await this.reportsService.submit(id, dto));
  }

  @Patch(':id/approve')
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveReportDto,
  ): Promise<ApiResponse<Report>> {
    return successResponse(await this.reportsService.approve(id, dto));
  }

  @Patch(':id/reject')
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectReportDto,
  ): Promise<ApiResponse<Report>> {
    return successResponse(await this.reportsService.reject(id, dto));
  }
}
