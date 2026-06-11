import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiKeyAuthGuard } from './common/guards/api-key-auth.guard';
import { createTypeOrmModuleOptions } from './config/database.config';
import { AdministrativeUnitsModule } from './modules/administrative-units/administrative-units.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { MapsModule } from './modules/maps/maps.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { ReportingPeriodsModule } from './modules/reporting-periods/reporting-periods.module';
import { ReportsModule } from './modules/reports/reports.module';
import { RolesModule } from './modules/roles/roles.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: createTypeOrmModuleOptions,
    }),
    AdministrativeUnitsModule,
    AuditLogsModule,
    DashboardModule,
    MapsModule,
    OrganizationsModule,
    PermissionsModule,
    ReportingPeriodsModule,
    ReportsModule,
    RolesModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ApiKeyAuthGuard,
    },
  ],
})
export class AppModule {}
