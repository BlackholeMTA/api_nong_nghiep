import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class SubmitReportDto {
  @IsUUID()
  nguoiGuiId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  lyDoThaoTacKhiKyDaKhoa?: string;
}
