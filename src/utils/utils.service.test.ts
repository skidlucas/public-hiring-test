import { Test, TestingModule } from '@nestjs/testing';
import { UtilsService } from './utils.service';

describe('UtilsService', () => {
  let service: UtilsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UtilsService],
    }).compile();

    service = module.get<UtilsService>(UtilsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw error when quantity is not defined', () => {
    expect(() => {
      const ingredient = {
        quantity: null!,
        unit: 'kg',
      };
      service.convertToKilograms(ingredient.quantity, ingredient.unit);
    }).toThrow('Quantity is not defined');
  });

  it('should throw error when unit is not defined', () => {
    expect(() => {
      const ingredient = {
        quantity: 0.14,
        unit: null!,
      };
      service.convertToKilograms(ingredient.quantity, ingredient.unit);
    }).toThrow('Unit is not defined');
  });

  it('should throw error when unit is not implemented', () => {
    expect(() => {
      const ingredient = {
        quantity: 0.14,
        unit: 'l',
      };
      service.convertToKilograms(ingredient.quantity, ingredient.unit);
    }).toThrow('Unit not valid or not implemented');
  });

  it('should convert correctly from g to kg', () => {
    const ingredient = {
      quantity: 1400,
      unit: 'g',
    };
    const kg = service.convertToKilograms(ingredient.quantity, ingredient.unit);
    expect(kg).toBe(ingredient.quantity / 1000);
  });

  it('should convert correctly from mg to kg', () => {
    const ingredient = {
      quantity: 1400,
      unit: 'mg',
    };
    const kg = service.convertToKilograms(ingredient.quantity, ingredient.unit);
    expect(kg).toBe(ingredient.quantity / 1000000);
  });

  it('shouldnt do anything when unit is already in kg', () => {
    const ingredient = {
      quantity: 0.14,
      unit: 'kg',
    };
    const kg = service.convertToKilograms(ingredient.quantity, ingredient.unit);
    expect(kg).toBe(ingredient.quantity);
  });
});
