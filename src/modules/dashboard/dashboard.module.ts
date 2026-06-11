import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdministrativeUnit } from '../administrative-units/entities/administrative-unit.entity';
import { ReportingPeriod } from '../reporting-periods/entities/reporting-period.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardMetric } from './entities/dashboard-metric.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DashboardMetric,
      ReportingPeriod,
      AdministrativeUnit,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
