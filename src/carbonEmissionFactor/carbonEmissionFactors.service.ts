import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CarbonEmissionFactor } from './carbonEmissionFactor.entity';
import { CreateCarbonEmissionFactorDto } from './dto/create-carbonEmissionFactor.dto';

@Injectable()
export class CarbonEmissionFactorsService {
  constructor(
    @InjectRepository(CarbonEmissionFactor)
    private carbonEmissionFactorRepository: Repository<CarbonEmissionFactor>,
  ) {}

  findAll(): Promise<CarbonEmissionFactor[]> {
    return this.carbonEmissionFactorRepository.find();
  }

  findByNames(names: string[]): Promise<CarbonEmissionFactor[]> {
    // I made the assumption that we will save every carbon emission factor in the unit "kg" and so that we don't need to filter on this
    return this.carbonEmissionFactorRepository.find({
      where: { name: In(names) },
    });
  }

  save(
    carbonEmissionFactor: CreateCarbonEmissionFactorDto[],
  ): Promise<CarbonEmissionFactor[] | null> {
    return this.carbonEmissionFactorRepository.save(carbonEmissionFactor);
  }
}
