import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { CarbonEmissionFactor } from './carbonEmissionFactor.entity';
import { CarbonEmissionFactorsService } from './carbonEmissionFactors.service';
import { CreateCarbonEmissionFactorDto } from './dto/create-carbonEmissionFactor.dto';

@Controller('carbon-emission-factors')
export class CarbonEmissionFactorsController {
  constructor(
    private readonly carbonEmissionFactorService: CarbonEmissionFactorsService,
  ) {}

  @Get()
  getCarbonEmissionFactors(): Promise<CarbonEmissionFactor[]> {
    Logger.log(
      `[carbon-emission-factors] [GET] CarbonEmissionFactor: getting all CarbonEmissionFactors`,
    );
    return this.carbonEmissionFactorService.findAll();
  }

  @Post()
  createCarbonEmissionFactors(
    @Body(ValidationPipe)
    carbonEmissionFactors: CreateCarbonEmissionFactorDto[],
  ): Promise<CarbonEmissionFactor[] | null> {
    Logger.log(
      `[carbon-emission-factors] [POST] CarbonEmissionFactor: ${carbonEmissionFactors} created`,
    );
    return this.carbonEmissionFactorService.save(carbonEmissionFactors);
  }
}
