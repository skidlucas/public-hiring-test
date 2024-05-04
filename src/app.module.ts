import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeorm } from '../config/dataSource';
import { CarbonEmissionFactorsModule } from './carbonEmissionFactor/carbonEmissionFactors.module';
import { UtilsModule } from './utils/utils.module';
import { FoodProductModule } from './food-product/food-product.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.getOrThrow('typeorm'),
    }),
    CarbonEmissionFactorsModule,
    UtilsModule,
    FoodProductModule,
  ],
})
export class AppModule {}
