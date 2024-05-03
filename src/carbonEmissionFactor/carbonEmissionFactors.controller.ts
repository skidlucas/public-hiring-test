import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { CarbonEmissionFactor } from './carbonEmissionFactor.entity';
import { CarbonEmissionFactorsService } from './carbonEmissionFactors.service';
import {
  CreateCarbonEmissionFactorDto,
  CreateCarbonEmissionFactorFromProductDto,
} from './dto/create-carbonEmissionFactor.dto';

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
    return this.carbonEmissionFactorService.saveFromDto(carbonEmissionFactors);
  }

  @Get(':name')
  getCarbonEmissionFactor(
    @Param('name') name: string,
  ): Promise<CarbonEmissionFactor> {
    Logger.log(
      `[carbon-emission-factors] [GET] CarbonEmissionFactor: getting CarbonEmissionFactor ${name}`,
    );
    return this.carbonEmissionFactorService.findByName(name);
  }

  @Post('product')
  createCarbonEmissionFactorFromProduct(
    @Body(ValidationPipe) product: CreateCarbonEmissionFactorFromProductDto,
  ): Promise<CarbonEmissionFactor> {
    Logger.log(
      `[carbon-emission-factors] [POST] CarbonEmissionFactor: product ${product.name} created`,
    );
    return this.carbonEmissionFactorService.createCarbonEmissionFactorFromProduct(
      product,
    );
  }
}
