import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CarbonEmissionFactor } from './carbonEmissionFactor.entity';
import {
  CreateCarbonEmissionFactorDto,
  CreateCarbonEmissionFactorFromProductDto,
} from './dto/create-carbonEmissionFactor.dto';
import { UtilsService } from '../utils/utils.service';
import { PsqlErrorCodes } from '../utils/psql-error-codes';

@Injectable()
export class CarbonEmissionFactorsService {
  constructor(
    @InjectRepository(CarbonEmissionFactor)
    private carbonEmissionFactorRepository: Repository<CarbonEmissionFactor>,
    private readonly utilsService: UtilsService,
  ) {}

  findAll(): Promise<CarbonEmissionFactor[]> {
    return this.carbonEmissionFactorRepository.find();
  }

  async findByName(name: string): Promise<CarbonEmissionFactor> {
    const carbonEmissionFactor =
      await this.carbonEmissionFactorRepository.findOne({
        select: ['name', 'emissionCO2eInKgPerUnit', 'source'],
        where: { name },
      });

    if (!carbonEmissionFactor) {
      throw new NotFoundException(`Carbon Emission factor ${name} not found`);
    }

    return carbonEmissionFactor;
  }

  findByNames(names: string[]): Promise<CarbonEmissionFactor[]> {
    // I made the assumption that we will save every carbon emission factor in the unit "kg" and so that we don't need to filter on this
    return this.carbonEmissionFactorRepository.find({
      where: { name: In(names) },
    });
  }

  saveFromDto(
    carbonEmissionFactor: CreateCarbonEmissionFactorDto[],
  ): Promise<CarbonEmissionFactor[] | null> {
    return this.carbonEmissionFactorRepository.save(carbonEmissionFactor);
  }

  async save(
    carbonEmissionFactor: CarbonEmissionFactor,
  ): Promise<CarbonEmissionFactor> {
    let savedCarbonEmissionFactor: CarbonEmissionFactor;
    try {
      savedCarbonEmissionFactor =
        await this.carbonEmissionFactorRepository.save(carbonEmissionFactor);
    } catch (e) {
      if (e.code === PsqlErrorCodes.UNIQUE_CONSTRAINT_VIOLATION) {
        throw new ConflictException(
          `Carbon Emission factor '${carbonEmissionFactor.name}' already exists`,
        );
      } else {
        throw new InternalServerErrorException(e);
      }
    }

    return savedCarbonEmissionFactor;
  }

  async createCarbonEmissionFactorFromProduct(
    product: CreateCarbonEmissionFactorFromProductDto,
  ): Promise<CarbonEmissionFactor> {
    const carbonEmissionFactorToSave = new CarbonEmissionFactor({
      name: product.name,
      unit: 'kg',
      emissionCO2eInKgPerUnit: null!,
      source: 'computed',
    });

    const ingredientNames = product.ingredients.map(
      (ingredient) => ingredient.name,
    );
    const carbonEmissionFactors = await this.findByNames(ingredientNames);

    if (!carbonEmissionFactors.length) {
      // business rule : If the carbon footprint of one ingredient cannot be calculated, then the carbon footprint of the whole product is set to null
      return this.save(carbonEmissionFactorToSave);
    }

    let carbonFootprint = 0;
    for (const ingredient of product.ingredients) {
      ingredient.quantity = this.utilsService.convertToKilograms(
        ingredient.quantity,
        ingredient.unit,
      );

      const matchingCarbonEmissionFactor = carbonEmissionFactors.find(
        (carbonEmissionFactor) => carbonEmissionFactor.name === ingredient.name,
      );
      if (matchingCarbonEmissionFactor?.emissionCO2eInKgPerUnit) {
        carbonFootprint +=
          ingredient.quantity *
          matchingCarbonEmissionFactor.emissionCO2eInKgPerUnit;
      } else {
        // the carbon footprint of one ingredient cannot be calculated then the whole product is set to null
        carbonFootprint = null!;
        break;
      }
    }

    carbonEmissionFactorToSave.emissionCO2eInKgPerUnit =
      carbonFootprint && Math.round(carbonFootprint * 100) / 100;
    return this.save(carbonEmissionFactorToSave);
  }
}
