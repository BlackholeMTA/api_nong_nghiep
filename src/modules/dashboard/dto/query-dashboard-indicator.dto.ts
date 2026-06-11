import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class QueryDashboardIndicatorDto {
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
