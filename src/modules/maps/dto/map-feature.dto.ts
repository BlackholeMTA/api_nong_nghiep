import {
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export type GeoJsonGeometry = Record<string, unknown>;

export class MapFeaturePropertiesDto {
  @IsUUID()
  lopBanDoId!: string;

  @IsString()
  @MaxLength(255)
  tieuDe!: string;

  @IsOptional()
  @IsString()
  moTa?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  bangNguon?: string;

  @IsOptional()
  @IsUUID()
  banGhiNguonId?: string;

  @IsOptional()
  @IsBoolean()
  hienThi?: boolean;

  @IsOptional()
  @IsString()
  viDo?: string;

  @IsOptional()
  @IsString()
  kinhDo?: string;

  [key: string]: unknown;
}

export class CreateMapFeatureDto {
  @IsIn(['Feature'])
  type!: 'Feature';

  @IsObject()
  geometry!: GeoJsonGeometry;

  @IsObject()
  properties!: MapFeaturePropertiesDto;
}

export class UpdateMapFeaturePropertiesDto {
  @IsOptional()
  @IsUUID()
  lopBanDoId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  tieuDe?: string;

  @IsOptional()
  @IsString()
  moTa?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  bangNguon?: string;

  @IsOptional()
  @IsUUID()
  banGhiNguonId?: string;

  @IsOptional()
  @IsBoolean()
  hienThi?: boolean;

  @IsOptional()
  @IsString()
  viDo?: string;

  @IsOptional()
  @IsString()
  kinhDo?: string;

  [key: string]: unknown;
}

export class UpdateMapFeatureDto {
  @IsOptional()
  @IsIn(['Feature'])
  type?: 'Feature';

  @IsOptional()
  @IsObject()
  geometry?: GeoJsonGeometry;

  @IsOptional()
  @IsObject()
  properties?: UpdateMapFeaturePropertiesDto;
}
