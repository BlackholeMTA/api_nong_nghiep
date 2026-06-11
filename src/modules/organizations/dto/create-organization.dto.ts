import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @MaxLength(50)
  ma!: string;

  @IsString()
  @MaxLength(255)
  ten!: string;

  @IsString()
  @MaxLength(100)
  loai!: string;

  @IsOptional()
  @IsUUID()
  chaId?: string;

  @IsOptional()
  @IsUUID()
  donViHanhChinhId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  diaChi?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  dienThoai?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsBoolean()
  dangHoatDong?: boolean;
}
