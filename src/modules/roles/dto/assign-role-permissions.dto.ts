import { ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class AssignRolePermissionsDto {
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  quyenHanIds!: string[];
}
