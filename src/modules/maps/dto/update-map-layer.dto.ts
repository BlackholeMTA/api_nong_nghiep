import { PartialType } from '@nestjs/mapped-types';
import { CreateMapLayerDto } from './create-map-layer.dto';

export class UpdateMapLayerDto extends PartialType(CreateMapLayerDto) {}
