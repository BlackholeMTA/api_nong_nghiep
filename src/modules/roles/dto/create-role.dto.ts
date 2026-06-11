import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @MaxLength(100)
  ma!: string;

  @IsString()
  @MaxLength(255)
  ten!: string;

  @IsOptional()
  @IsString()
  moTa?: string;

  @IsOptional()
  @IsBoolean()
  dangHoatDong?: boolean;
}
