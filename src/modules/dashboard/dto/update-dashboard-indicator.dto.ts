import { PartialType } from '@nestjs/mapped-types';
import { CreateDashboardIndicatorDto } from './create-dashboard-indicator.dto';

export class UpdateDashboardIndicatorDto extends PartialType(
  CreateDashboardIndicatorDto,
) {}
