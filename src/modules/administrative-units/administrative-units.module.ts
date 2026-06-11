import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdministrativeUnitsController } from './administrative-units.controller';
import { AdministrativeUnitsService } from './administrative-units.service';
import { AdministrativeUnitAlias } from './entities/administrative-unit-alias.entity';
import { AdministrativeUnit } from './entities/administrative-unit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdministrativeUnit, AdministrativeUnitAlias]),
  ],
  controllers: [AdministrativeUnitsController],
  providers: [AdministrativeUnitsService],
  exports: [AdministrativeUnitsService],
})
export class AdministrativeUnitsModule {}
