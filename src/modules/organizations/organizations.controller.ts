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
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { QueryOrganizationDto } from './dto/query-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { Organization } from './entities/organization.entity';
import { OrganizationsService } from './organizations.service';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  async findAll(
    @Query() query: QueryOrganizationDto,
  ): Promise<ApiResponse<Organization[]>> {
    const result = await this.organizationsService.findAll(query);

    return successResponse(result.items, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    });
  }

  @Get('tree')
  async findTree(): Promise<ApiResponse<Organization[]>> {
    return successResponse(await this.organizationsService.findTree());
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<Organization>> {
    return successResponse(await this.organizationsService.findOne(id));
  }

  @Post()
  async create(
    @Body() dto: CreateOrganizationDto,
  ): Promise<ApiResponse<Organization>> {
    return successResponse(await this.organizationsService.create(dto));
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrganizationDto,
  ): Promise<ApiResponse<Organization>> {
    return successResponse(await this.organizationsService.update(id, dto));
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<Organization>> {
    return successResponse(await this.organizationsService.deactivate(id));
  }
}
