import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class QueryAdministrativeUnitDto {
  @IsOptional()
  @IsString()
  ma?: string;

  @IsOptional()
  @IsString()
  ten?: string;

  @IsOptional()
  @IsString()
  cap?: string;

  @IsOptional()
  @IsUUID()
  chaId?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return String(value);
  })
  @IsBoolean()
  dangHoatDong?: boolean;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
