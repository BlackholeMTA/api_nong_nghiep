import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ApproveReportDto {
  @IsUUID()
  nguoiDuyetId!: string;

  @IsOptional()
  @IsString()
  yKien?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  lyDoThaoTacKhiKyDaKhoa?: string;
}
