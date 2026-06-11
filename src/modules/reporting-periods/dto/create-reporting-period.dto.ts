import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateReportingPeriodDto {
  @IsString()
  @MaxLength(50)
  ma!: string;

  @IsString()
  @MaxLength(255)
  ten!: string;

  @IsInt()
  @Min(1900)
  nam!: number;

  @IsString()
  @MaxLength(50)
  loaiKy!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  soKy?: number;

  @IsDateString()
  ngayBatDau!: string;

  @IsDateString()
  ngayKetThuc!: string;

  @IsOptional()
  @IsBoolean()
  daKhoa?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  thuTuSapXep?: number;
}
