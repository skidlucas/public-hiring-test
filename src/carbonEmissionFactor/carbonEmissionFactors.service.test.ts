import { dataSource, GreenlyDataSource } from '../../config/dataSource';
import { getTestEmissionFactor } from '../seed-dev-data';
import { CarbonEmissionFactor } from './carbonEmissionFactor.entity';
import { CarbonEmissionFactorsService } from './carbonEmissionFactors.service';

const enum TestEmissionFactor {
  FLOUR = 'flour',
  HAM = 'ham',
  OLIVE_OIL = 'oliveOil',
}

const flourEmissionFactor = getTestEmissionFactor(TestEmissionFactor.FLOUR);
const hamEmissionFactor = getTestEmissionFactor(TestEmissionFactor.HAM);
const oliveOilEmissionFactor = getTestEmissionFactor(
  TestEmissionFactor.OLIVE_OIL,
);
let carbonEmissionFactorService: CarbonEmissionFactorsService;

beforeAll(async () => {
  await dataSource.initialize();
  carbonEmissionFactorService = new CarbonEmissionFactorsService(
    dataSource.getRepository(CarbonEmissionFactor),
  );
});

beforeEach(async () => {
  await GreenlyDataSource.cleanDatabase();
  await dataSource
    .getRepository(CarbonEmissionFactor)
    .save(oliveOilEmissionFactor);
});

describe('save', () => {
  it('should save new emissionFactors from DTO', async () => {
    await carbonEmissionFactorService.save([
      hamEmissionFactor,
      flourEmissionFactor,
    ]);
    const retrieveChickenEmissionFactor = await dataSource
      .getRepository(CarbonEmissionFactor)
      .findOne({ where: { name: TestEmissionFactor.FLOUR } });
    expect(retrieveChickenEmissionFactor?.name).toBe(TestEmissionFactor.FLOUR);
  });
});

describe('findAll', () => {
  it('should retrieve emission Factors', async () => {
    const carbonEmissionFactors = await carbonEmissionFactorService.findAll();
    expect(carbonEmissionFactors).toHaveLength(1);
  });
});

describe('findByNames', () => {
  it('should retrieve emission Factors by names', async () => {
    const carbonEmissionFactors = await carbonEmissionFactorService.findByNames(
      [TestEmissionFactor.OLIVE_OIL],
    );
    expect(carbonEmissionFactors).toHaveLength(1);
  });
});

afterAll(async () => {
  await dataSource.destroy();
});
