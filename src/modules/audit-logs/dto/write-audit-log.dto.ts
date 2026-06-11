import {
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class WriteAuditLogDto {
  @IsOptional()
  @IsUUID()
  nguoiDungId?: string | null;

  @IsString()
  @MaxLength(100)
  hanhDong!: string;

  @IsString()
  @MaxLength(100)
  bangNguon!: string;

  @IsUUID()
  banGhiNguonId!: string;

  @IsOptional()
  @IsObject()
  duLieuCu?: Record<string, unknown> | null;

  @IsOptional()
  @IsObject()
  duLieuMoi?: Record<string, unknown> | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  diaChiIp?: string | null;

  @IsOptional()
  @IsString()
  tacNhanNguoiDung?: string | null;
}
