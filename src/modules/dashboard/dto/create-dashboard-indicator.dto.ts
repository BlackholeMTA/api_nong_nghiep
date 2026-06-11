import {
  IsDateString,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateDashboardIndicatorDto {
  @IsUUID()
  kyBaoCaoId!: string;

  @IsString()
  @MaxLength(100)
  phanHe!: string;

  @IsString()
  @MaxLength(150)
  maChiSo!: string;

  @IsString()
  @MaxLength(255)
  tenChiSo!: string;

  @IsOptional()
  @IsNumberString()
  giaTriChiSo?: string;

  @IsString()
  @MaxLength(100)
  donViTinh!: string;

  @IsOptional()
  @IsUUID()
  donViHanhChinhId?: string;

  @IsOptional()
  @IsDateString()
  tinhToanLuc?: string;
}
