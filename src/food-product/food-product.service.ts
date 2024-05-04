import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UtilsService } from '../utils/utils.service';
import { FoodProduct } from './food-product.entity';
import { PsqlErrorCodes } from '../utils/psql-error-codes';
import { CreateFoodProductDto } from './dto/food-product.dto';
import { CarbonEmissionFactorsService } from '../carbonEmissionFactor/carbonEmissionFactors.service';

@Injectable()
export class FoodProductService {
  constructor(
    @InjectRepository(FoodProduct)
    private foodProductRepository: Repository<FoodProduct>,
    private readonly carbonEmissionFactorsService: CarbonEmissionFactorsService,
    private readonly utilsService: UtilsService,
  ) {}

  async findByName(name: string): Promise<FoodProduct> {
    const foodProduct = await this.foodProductRepository.findOne({
      select: ['name', 'carbonFootprint'],
      where: { name },
    });

    if (!foodProduct) {
      throw new NotFoundException(`Food Product ${name} not found`);
    }

    return foodProduct;
  }

  async save(foodProduct: FoodProduct): Promise<FoodProduct> {
    let savedFoodProduct: FoodProduct;
    try {
      savedFoodProduct = await this.foodProductRepository.save(foodProduct);
    } catch (e) {
      if (e.code === PsqlErrorCodes.UNIQUE_CONSTRAINT_VIOLATION) {
        throw new ConflictException(
          `Food Product '${foodProduct.name}' already exists`,
        );
      } else {
        throw new InternalServerErrorException(e);
      }
    }

    return savedFoodProduct;
  }

  async createFoodProduct(product: CreateFoodProductDto): Promise<FoodProduct> {
    let carbonFootprintIsNotComputable = false;
    const foodProductToSave = new FoodProduct({
      name: product.name,
    });

    const ingredientNames = product.ingredients.map((ingredient) =>
      this.utilsService.normalize(ingredient.name),
    );
    const carbonEmissionFactors =
      await this.carbonEmissionFactorsService.findByNames(ingredientNames);

    if (!carbonEmissionFactors.length) {
      // business rule : If the carbon footprint of one ingredient cannot be calculated, then the carbon footprint of the whole product is set to null
      carbonFootprintIsNotComputable = true;
    }

    let carbonFootprint = 0;
    for (const ingredient of product.ingredients) {
      ingredient.name = this.utilsService.normalize(ingredient.name);
      ingredient.quantity = this.utilsService.convertToKilograms(
        ingredient.quantity,
        ingredient.unit,
      );

      const matchingCarbonEmissionFactor = carbonEmissionFactors.find(
        (carbonEmissionFactor) =>
          this.utilsService.normalize(carbonEmissionFactor.name) ===
          ingredient.name,
      );
      if (matchingCarbonEmissionFactor?.emissionCO2eInKgPerUnit) {
        carbonFootprint +=
          ingredient.quantity *
          matchingCarbonEmissionFactor.emissionCO2eInKgPerUnit;
      } else {
        // the carbon footprint of one ingredient cannot be calculated then the whole product is set to null
        carbonFootprintIsNotComputable = true;
      }
    }

    foodProductToSave.ingredients = product.ingredients;
    foodProductToSave.carbonFootprint = carbonFootprintIsNotComputable
      ? null!
      : Math.round(carbonFootprint * 100) / 100;
    return this.save(foodProductToSave);
  }
}
