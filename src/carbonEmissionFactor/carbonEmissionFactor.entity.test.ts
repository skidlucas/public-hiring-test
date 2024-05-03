import { dataSource, GreenlyDataSource } from '../../config/dataSource';
import { CarbonEmissionFactor } from './carbonEmissionFactor.entity';

beforeAll(async () => {
  await dataSource.initialize();
});

beforeEach(async () => {
  await GreenlyDataSource.cleanDatabase();
});

describe('FoodProductEntity', () => {
  describe('constructor', () => {
    it('should create an emission factor', () => {
      const chickenEmissionFactor = new CarbonEmissionFactor({
        emissionCO2eInKgPerUnit: 2.4,
        unit: 'kg',
        name: 'chicken',
        source: 'Agrybalise',
      });

      expect(chickenEmissionFactor.name).toBe('chicken');
    });

    it('should create an emission factor with null emission', () => {
      const unknownEmissionFactor = new CarbonEmissionFactor({
        unit: 'kg',
        name: 'unknown',
        source: 'Agrybalise',
      });
      expect(unknownEmissionFactor.name).toBe('unknown');
      expect(unknownEmissionFactor.emissionCO2eInKgPerUnit).toBe(null);
    });

    it('should throw an error if the source is empty', () => {
      expect(() => {
        new CarbonEmissionFactor({
          emissionCO2eInKgPerUnit: 2.4,
          unit: 'kg',
          name: 'chicken',
          source: '',
        });
      }).toThrow();
    });
  });
});

afterAll(async () => {
  await dataSource.destroy();
});
