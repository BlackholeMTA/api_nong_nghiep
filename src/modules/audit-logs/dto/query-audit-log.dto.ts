import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class QueryAuditLogDto {
  @IsOptional()
  @IsUUID()
  nguoiDungId?: string;

  @IsOptional()
  @IsString()
  hanhDong?: string;

  @IsOptional()
  @IsString()
  bangNguon?: string;

  @IsOptional()
  @IsUUID()
  banGhiNguonId?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

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
