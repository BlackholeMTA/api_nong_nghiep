import { IsString, MaxLength } from 'class-validator';

export class CreateAdministrativeUnitAliasDto {
  @IsString()
  @MaxLength(255)
  tenBiDanh!: string;

  @IsString()
  @MaxLength(100)
  loaiBiDanh!: string;
}
