import { IsString, MaxLength } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @MaxLength(150)
  ma!: string;

  @IsString()
  @MaxLength(100)
  phanHe!: string;

  @IsString()
  @MaxLength(100)
  hanhDong!: string;

  @IsString()
  @MaxLength(255)
  ten!: string;
}
