import { PartialType } from '@nestjs/mapped-types';
import { CreateAdministrativeUnitDto } from './create-administrative-unit.dto';

export class UpdateAdministrativeUnitDto extends PartialType(
  CreateAdministrativeUnitDto,
) {}
