import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateAdministrativeUnitDto {
  @IsString()
  @MaxLength(50)
  ma!: string;

  @IsString()
  @MaxLength(255)
  ten!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  tenDayDu?: string;

  @IsString()
  @MaxLength(50)
  cap!: string;

  @IsOptional()
  @IsUUID()
  chaId?: string;

  @IsOptional()
  @IsBoolean()
  laDuLieuCu?: boolean;

  @IsOptional()
  @IsDateString()
  hieuLucTuNgay?: string;

  @IsOptional()
  @IsDateString()
  hieuLucDenNgay?: string;

  @IsOptional()
  @IsObject()
  hinhHoc?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  thuTuSapXep?: number;

  @IsOptional()
  @IsBoolean()
  dangHoatDong?: boolean;
}
