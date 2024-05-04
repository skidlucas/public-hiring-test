import { IsNumber, IsString } from 'class-validator';

export class CreateCarbonEmissionFactorDto {
  @IsString()
  name: string;

  @IsString()
  unit: string;

  @IsNumber()
  emissionCO2eInKgPerUnit: number;

  @IsString()
  source: string;
}
