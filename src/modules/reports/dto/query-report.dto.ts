import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ReportStatus } from '../report-status.enum';

export class QueryReportDto {
  @IsOptional()
  @IsUUID()
  kyBaoCaoId?: string;

  @IsOptional()
  @IsString()
  phanHe?: string;

  @IsOptional()
  @IsUUID()
  donViHanhChinhId?: string;

  @IsOptional()
  @IsEnum(ReportStatus)
  trangThai?: ReportStatus;

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
