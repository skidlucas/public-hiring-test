import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarbonEmissionFactor } from './carbonEmissionFactor.entity';
import { CarbonEmissionFactorsService } from './carbonEmissionFactors.service';
import { CarbonEmissionFactorsController } from './carbonEmissionFactors.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CarbonEmissionFactor])],
  providers: [CarbonEmissionFactorsService],
  controllers: [CarbonEmissionFactorsController],
  exports: [CarbonEmissionFactorsService],
})
export class CarbonEmissionFactorsModule {}
