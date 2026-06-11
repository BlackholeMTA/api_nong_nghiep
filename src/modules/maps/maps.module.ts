import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapFeaturesController } from './map-features.controller';
import { MapLayersController } from './map-layers.controller';
import { MapObject } from './entities/map-object.entity';
import { MapLayer } from './entities/map-layer.entity';
import { MapFeaturesService } from './map-features.service';
import { MapLayersService } from './map-layers.service';

@Module({
  imports: [TypeOrmModule.forFeature([MapLayer, MapObject])],
  controllers: [MapLayersController, MapFeaturesController],
  providers: [MapLayersService, MapFeaturesService],
  exports: [MapLayersService, MapFeaturesService],
})
export class MapsModule {}
