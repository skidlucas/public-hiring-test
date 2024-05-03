import { dataSource, GreenlyDataSource } from '../../config/dataSource';
import { getTestEmissionFactor } from '../seed-dev-data';
import { CarbonEmissionFactor } from './carbonEmissionFactor.entity';
import { CarbonEmissionFactorsService } from './carbonEmissionFactors.service';
import { UtilsService } from '../utils/utils.service';
import { CreateCarbonEmissionFactorFromProductDto } from './dto/create-carbonEmissionFactor.dto';

const enum TestEmissionFactor {
  FLOUR = 'flour',
  HAM = 'ham',
  OLIVE_OIL = 'oliveOil',
  TOMATO = 'tomato',
  CHEESE = 'cheese',
  CHOCOLATE = 'chocolate',
}

const flourEmissionFactor = getTestEmissionFactor(TestEmissionFactor.FLOUR);
const hamEmissionFactor = getTestEmissionFactor(TestEmissionFactor.HAM);
const oliveOilEmissionFactor = getTestEmissionFactor(
  TestEmissionFactor.OLIVE_OIL,
);
const tomatoEmissionFactor = getTestEmissionFactor(TestEmissionFactor.TOMATO);
const cheeseEmissionFactor = getTestEmissionFactor(TestEmissionFactor.CHEESE);
let carbonEmissionFactorService: CarbonEmissionFactorsService;

beforeAll(async () => {
  await dataSource.initialize();
  carbonEmissionFactorService = new CarbonEmissionFactorsService(
    dataSource.getRepository(CarbonEmissionFactor),
    new UtilsService(),
  );
});

beforeEach(async () => {
  await GreenlyDataSource.cleanDatabase();
  await dataSource
    .getRepository(CarbonEmissionFactor)
    .save(oliveOilEmissionFactor);
});

describe('saveFromDto', () => {
  it('should save new emissionFactors from DTO', async () => {
    await carbonEmissionFactorService.saveFromDto([
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

describe('findByName', () => {
  it('should retrieve emission Factor by name', async () => {
    const oliveOil = await carbonEmissionFactorService.findByName(
      TestEmissionFactor.OLIVE_OIL,
    );
    expect(oliveOil.name).toBe(oliveOilEmissionFactor.name);
    expect(oliveOil.emissionCO2eInKgPerUnit).toBe(
      oliveOilEmissionFactor.emissionCO2eInKgPerUnit,
    );
  });

  it('should throw error if not emission factor is found', async () => {
    await expect(
      carbonEmissionFactorService.findByName(TestEmissionFactor.HAM),
    ).rejects.toThrow(
      `Carbon Emission factor ${TestEmissionFactor.HAM} not found`,
    );
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

describe('save', () => {
  it('should save new emission factor', async () => {
    const chocolateEmissionFactor = new CarbonEmissionFactor({
      name: TestEmissionFactor.CHOCOLATE,
      unit: 'kg',
      emissionCO2eInKgPerUnit: 0.3,
      source: 'Agrybalise',
    });

    await carbonEmissionFactorService.save(chocolateEmissionFactor);
    const retrieveChocolateEmissionFactor = await dataSource
      .getRepository(CarbonEmissionFactor)
      .findOne({ where: { name: TestEmissionFactor.CHOCOLATE } });
    expect(retrieveChocolateEmissionFactor?.name).toBe(
      TestEmissionFactor.CHOCOLATE,
    );
  });

  it('should throw conflict error if the emission already exists', async () => {
    const oliveOilEmissionFactor = new CarbonEmissionFactor({
      name: TestEmissionFactor.OLIVE_OIL,
      unit: 'kg',
      emissionCO2eInKgPerUnit: 0.3,
      source: 'Agrybalise',
    });

    await expect(
      carbonEmissionFactorService.save(oliveOilEmissionFactor),
    ).rejects.toThrow(
      `Carbon Emission factor '${oliveOilEmissionFactor.name}' already exists`,
    );
  });

  it('should throw error if the emission entity is wrong', async () => {
    const oliveOilEmissionFactor = new CarbonEmissionFactor({
      name: null!,
      unit: 'kg',
      emissionCO2eInKgPerUnit: 0.3,
      source: 'Agrybalise',
    });

    await expect(
      carbonEmissionFactorService.save(oliveOilEmissionFactor),
    ).rejects.toThrow();
  });
});

describe('createCarbonEmissionFactorFromProduct', () => {
  it('should create a new emission factor with null value if no ingredients are known', async () => {
    const chocolateBarDto: CreateCarbonEmissionFactorFromProductDto = {
      name: 'chocolateBar',
      ingredients: [
        {
          name: 'chocolate',
          quantity: 0.2,
          unit: 'kg',
        },
        {
          name: 'cereal',
          quantity: 0.15,
          unit: 'kg',
        },
        {
          name: 'butter',
          quantity: 0.1,
          unit: 'kg',
        },
        {
          name: 'flour',
          quantity: 0.1,
          unit: 'kg',
        },
        {
          name: 'sugar',
          quantity: 0.2,
          unit: 'kg',
        },
      ],
    };

    const carbonEmissionFactor =
      await carbonEmissionFactorService.createCarbonEmissionFactorFromProduct(
        chocolateBarDto,
      );
    expect(carbonEmissionFactor.name).toBe('chocolateBar');
    expect(carbonEmissionFactor.emissionCO2eInKgPerUnit).toBeNull();
  });

  it('should create a new emission factor with null value if one ingredient is not known', async () => {
    const vinaigretteDto: CreateCarbonEmissionFactorFromProductDto = {
      name: 'vinaigrette',
      ingredients: [
        {
          name: 'oliveOil',
          quantity: 0.2,
          unit: 'kg',
        },
        {
          name: 'vinegar',
          quantity: 0.1,
          unit: 'kg',
        },
      ],
    };

    const carbonEmissionFactor =
      await carbonEmissionFactorService.createCarbonEmissionFactorFromProduct(
        vinaigretteDto,
      );
    expect(carbonEmissionFactor.name).toBe('vinaigrette');
    expect(carbonEmissionFactor.emissionCO2eInKgPerUnit).toBeNull();
  });

  it('should create a new emission factor from a product correctly', async () => {
    const hamCheesePizzaDto: CreateCarbonEmissionFactorFromProductDto = {
      name: 'hamCheesePizza',
      ingredients: [
        {
          name: 'ham',
          quantity: 0.1,
          unit: 'kg',
        },
        {
          name: 'cheese',
          quantity: 0.15,
          unit: 'kg',
        },
        {
          name: 'tomato',
          quantity: 0.4,
          unit: 'kg',
        },
        {
          name: 'flour',
          quantity: 0.7,
          unit: 'kg',
        },
        {
          name: 'oliveOil',
          quantity: 0.3,
          unit: 'kg',
        },
      ],
    };

    await carbonEmissionFactorService.saveFromDto([
      hamEmissionFactor,
      flourEmissionFactor,
      tomatoEmissionFactor,
      cheeseEmissionFactor,
    ]);

    const carbonEmissionFactor =
      await carbonEmissionFactorService.createCarbonEmissionFactorFromProduct(
        hamCheesePizzaDto,
      );
    expect(carbonEmissionFactor.name).toBe('hamCheesePizza');
    expect(carbonEmissionFactor.emissionCO2eInKgPerUnit).toBeGreaterThan(0);
  });
});

afterAll(async () => {
  await dataSource.destroy();
});
