import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarbonEmissionFactor } from './carbonEmissionFactor.entity';
import { CarbonEmissionFactorsService } from './carbonEmissionFactors.service';
import { CarbonEmissionFactorsController } from './carbonEmissionFactors.controller';
import { UtilsModule } from '../utils/utils.module';

@Module({
  imports: [TypeOrmModule.forFeature([CarbonEmissionFactor]), UtilsModule],
  providers: [CarbonEmissionFactorsService],
  controllers: [CarbonEmissionFactorsController],
})
export class CarbonEmissionFactorsModule {}
