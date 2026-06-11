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
import { Role } from '../roles/entities/role.entity';
import { AssignUserRolesDto } from './dto/assign-user-roles.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { sanitizeUser, sanitizeUsers, UserResponse } from './user-response';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(
    @Query() query: QueryUserDto,
  ): Promise<ApiResponse<UserResponse[]>> {
    const result = await this.usersService.findAll(query);

    return successResponse(sanitizeUsers(result.items), {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    });
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<UserResponse>> {
    return successResponse(sanitizeUser(await this.usersService.findOne(id)));
  }

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<ApiResponse<UserResponse>> {
    return successResponse(sanitizeUser(await this.usersService.create(dto)));
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<ApiResponse<UserResponse>> {
    return successResponse(
      sanitizeUser(await this.usersService.update(id, dto)),
    );
  }

  @Patch(':id/change-password')
  async changePassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangePasswordDto,
  ): Promise<ApiResponse<UserResponse>> {
    return successResponse(
      sanitizeUser(await this.usersService.changePassword(id, dto)),
    );
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<UserResponse>> {
    return successResponse(
      sanitizeUser(await this.usersService.deactivate(id)),
    );
  }

  @Post(':id/roles')
  async assignRoles(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignUserRolesDto,
  ): Promise<ApiResponse<Role[]>> {
    return successResponse(await this.usersService.assignRoles(id, dto));
  }

  @Get(':id/roles')
  async findRoles(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<Role[]>> {
    return successResponse(await this.usersService.findRoles(id));
  }
}
