import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ReportStatus } from '../report-status.enum';

export class CreateReportDto {
  @IsUUID()
  kyBaoCaoId!: string;

  @IsString()
  @MaxLength(100)
  phanHe!: string;

  @IsOptional()
  @IsUUID()
  donViHanhChinhId?: string;

  @IsOptional()
  @IsEnum(ReportStatus)
  trangThai?: ReportStatus;

  @IsOptional()
  @IsString()
  yKien?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  lyDoThaoTacKhiKyDaKhoa?: string;
}
