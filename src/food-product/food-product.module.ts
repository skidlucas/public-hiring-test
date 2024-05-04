import { Module } from '@nestjs/common';
import { FoodProductService } from './food-product.service';
import { FoodProductController } from './food-product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilsModule } from '../utils/utils.module';
import { CarbonEmissionFactorsModule } from '../carbonEmissionFactor/carbonEmissionFactors.module';
import { FoodProduct } from './food-product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FoodProduct]),
    UtilsModule,
    CarbonEmissionFactorsModule,
  ],
  providers: [FoodProductService],
  controllers: [FoodProductController],
})
export class FoodProductModule {}
