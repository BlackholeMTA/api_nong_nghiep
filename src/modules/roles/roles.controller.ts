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
import { Permission } from '../permissions/entities/permission.entity';
import { AssignRolePermissionsDto } from './dto/assign-role-permissions.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async findAll(@Query() query: QueryRoleDto): Promise<ApiResponse<Role[]>> {
    const result = await this.rolesService.findAll(query);

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
  ): Promise<ApiResponse<Role>> {
    return successResponse(await this.rolesService.findOne(id));
  }

  @Post()
  async create(@Body() dto: CreateRoleDto): Promise<ApiResponse<Role>> {
    return successResponse(await this.rolesService.create(dto));
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
  ): Promise<ApiResponse<Role>> {
    return successResponse(await this.rolesService.update(id, dto));
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<Role>> {
    return successResponse(await this.rolesService.deactivate(id));
  }

  @Post(':id/permissions')
  async assignPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignRolePermissionsDto,
  ): Promise<ApiResponse<Permission[]>> {
    return successResponse(await this.rolesService.assignPermissions(id, dto));
  }

  @Get(':id/permissions')
  async findPermissions(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<Permission[]>> {
    return successResponse(await this.rolesService.findPermissions(id));
  }
}
