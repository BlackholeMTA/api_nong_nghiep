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
import { CreatePermissionDto } from './dto/create-permission.dto';
import { QueryPermissionDto } from './dto/query-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  async findAll(
    @Query() query: QueryPermissionDto,
  ): Promise<ApiResponse<Permission[]>> {
    const result = await this.permissionsService.findAll(query);

    return successResponse(result.items, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    });
  }

  @Post()
  async create(
    @Body() dto: CreatePermissionDto,
  ): Promise<ApiResponse<Permission>> {
    return successResponse(await this.permissionsService.create(dto));
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePermissionDto,
  ): Promise<ApiResponse<Permission>> {
    return successResponse(await this.permissionsService.update(id, dto));
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<Permission>> {
    return successResponse(await this.permissionsService.delete(id));
  }
}
