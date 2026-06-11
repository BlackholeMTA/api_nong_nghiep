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
import { AdministrativeUnitsService } from './administrative-units.service';
import { CreateAdministrativeUnitAliasDto } from './dto/create-administrative-unit-alias.dto';
import { CreateAdministrativeUnitDto } from './dto/create-administrative-unit.dto';
import { QueryAdministrativeUnitDto } from './dto/query-administrative-unit.dto';
import { UpdateAdministrativeUnitDto } from './dto/update-administrative-unit.dto';
import { AdministrativeUnitAlias } from './entities/administrative-unit-alias.entity';
import { AdministrativeUnit } from './entities/administrative-unit.entity';

@Controller('administrative-units')
export class AdministrativeUnitsController {
  constructor(
    private readonly administrativeUnitsService: AdministrativeUnitsService,
  ) {}

  @Get()
  async findAll(
    @Query() query: QueryAdministrativeUnitDto,
  ): Promise<ApiResponse<AdministrativeUnit[]>> {
    const result = await this.administrativeUnitsService.findAll(query);

    return successResponse(result.items, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    });
  }

  @Get('tree')
  async findTree(): Promise<ApiResponse<AdministrativeUnit[]>> {
    return successResponse(await this.administrativeUnitsService.findTree());
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<AdministrativeUnit>> {
    return successResponse(await this.administrativeUnitsService.findOne(id));
  }

  @Post()
  async create(
    @Body() dto: CreateAdministrativeUnitDto,
  ): Promise<ApiResponse<AdministrativeUnit>> {
    return successResponse(await this.administrativeUnitsService.create(dto));
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdministrativeUnitDto,
  ): Promise<ApiResponse<AdministrativeUnit>> {
    return successResponse(
      await this.administrativeUnitsService.update(id, dto),
    );
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<AdministrativeUnit>> {
    return successResponse(
      await this.administrativeUnitsService.deactivate(id),
    );
  }

  @Get(':id/aliases')
  async findAliases(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<AdministrativeUnitAlias[]>> {
    return successResponse(
      await this.administrativeUnitsService.findAliases(id),
    );
  }

  @Post(':id/aliases')
  async createAlias(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateAdministrativeUnitAliasDto,
  ): Promise<ApiResponse<AdministrativeUnitAlias>> {
    return successResponse(
      await this.administrativeUnitsService.createAlias(id, dto),
    );
  }
}
