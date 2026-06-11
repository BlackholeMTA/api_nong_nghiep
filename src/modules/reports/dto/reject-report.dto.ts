import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class RejectReportDto {
  @IsUUID()
  nguoiDuyetId!: string;

  @IsString()
  yKien!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  lyDoThaoTacKhiKyDaKhoa?: string;
}
