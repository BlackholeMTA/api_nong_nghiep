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
  CreateMapFeatureDto,
  UpdateMapFeatureDto,
} from './dto/map-feature.dto';
import { QueryMapFeatureDto } from './dto/query-map-feature.dto';
import {
  GeoJsonFeature,
  GeoJsonFeatureCollection,
  GeoJsonFeatureCollectionResult,
  MapFeaturesService,
} from './map-features.service';

@Controller('map-features')
export class MapFeaturesController {
  constructor(private readonly mapFeaturesService: MapFeaturesService) {}

  @Get()
  async findAll(
    @Query() query: QueryMapFeatureDto,
  ): Promise<ApiResponse<GeoJsonFeatureCollection>> {
    const result: GeoJsonFeatureCollectionResult =
      await this.mapFeaturesService.findAll(query);

    return successResponse(result.collection, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    });
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<GeoJsonFeature>> {
    return successResponse(await this.mapFeaturesService.findOne(id));
  }

  @Post()
  async create(
    @Body() dto: CreateMapFeatureDto,
  ): Promise<ApiResponse<GeoJsonFeature>> {
    return successResponse(await this.mapFeaturesService.create(dto));
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMapFeatureDto,
  ): Promise<ApiResponse<GeoJsonFeature>> {
    return successResponse(await this.mapFeaturesService.update(id, dto));
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<GeoJsonFeature>> {
    return successResponse(await this.mapFeaturesService.hide(id));
  }
}
