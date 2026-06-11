import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdministrativeUnit } from '../administrative-units/entities/administrative-unit.entity';
import { ReportingPeriod } from '../reporting-periods/entities/reporting-period.entity';
import { User } from '../users/entities/user.entity';
import { Report } from './entities/report.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Report,
      ReportingPeriod,
      AdministrativeUnit,
      User,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
