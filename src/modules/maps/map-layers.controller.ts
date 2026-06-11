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
import { CreateMapLayerDto } from './dto/create-map-layer.dto';
import { QueryMapLayerDto } from './dto/query-map-layer.dto';
import { UpdateMapLayerDto } from './dto/update-map-layer.dto';
import { MapLayer } from './entities/map-layer.entity';
import { MapLayersService } from './map-layers.service';

@Controller('map-layers')
export class MapLayersController {
  constructor(private readonly mapLayersService: MapLayersService) {}

  @Get()
  async findAll(
    @Query() query: QueryMapLayerDto,
  ): Promise<ApiResponse<MapLayer[]>> {
    const result = await this.mapLayersService.findAll(query);

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
  ): Promise<ApiResponse<MapLayer>> {
    return successResponse(await this.mapLayersService.findOne(id));
  }

  @Post()
  async create(@Body() dto: CreateMapLayerDto): Promise<ApiResponse<MapLayer>> {
    return successResponse(await this.mapLayersService.create(dto));
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMapLayerDto,
  ): Promise<ApiResponse<MapLayer>> {
    return successResponse(await this.mapLayersService.update(id, dto));
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<MapLayer>> {
    return successResponse(await this.mapLayersService.deactivate(id));
  }
}
