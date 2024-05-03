import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

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

export class CreateCarbonEmissionFactorFromProductDto {
  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FoodIngredientDto)
  ingredients: FoodIngredientDto[];
}

export class FoodIngredientDto {
  @IsString()
  name: string;

  @IsNumber()
  quantity: number;

  @IsString()
  unit: string;
}
