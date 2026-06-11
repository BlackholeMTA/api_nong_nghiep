import {
  IsBoolean,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateMapLayerDto {
  @IsString()
  @MaxLength(100)
  ma!: string;

  @IsString()
  @MaxLength(255)
  ten!: string;

  @IsString()
  @MaxLength(100)
  phanHe!: string;

  @IsString()
  @MaxLength(50)
  loaiHinhHoc!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  duongDanBieuTuong?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  mauSac?: string;

  @IsOptional()
  @IsNumberString()
  doMo?: string;

  @IsOptional()
  @IsInt()
  chiSoZ?: number;

  @IsOptional()
  @IsBoolean()
  macDinhHienThi?: boolean;

  @IsOptional()
  @IsBoolean()
  dangHoatDong?: boolean;

  @IsOptional()
  @IsInt()
  thuTuSapXep?: number;
}
