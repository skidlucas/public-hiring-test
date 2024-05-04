import { FoodProductService } from './food-product.service';
import { CarbonEmissionFactor } from '../carbonEmissionFactor/carbonEmissionFactor.entity';
import { dataSource, GreenlyDataSource } from '../../config/dataSource';
import { CarbonEmissionFactorsService } from '../carbonEmissionFactor/carbonEmissionFactors.service';
import { FoodProduct } from './food-product.entity';
import { UtilsService } from '../utils/utils.service';
import { getTestEmissionFactor, vinaigrette } from '../seed-dev-data';
import { CreateFoodProductDto } from './dto/food-product.dto';

const enum TestEmissionFactor {
  FLOUR = 'flour',
  HAM = 'ham',
  OLIVE_OIL = 'oliveOil',
  TOMATO = 'tomato',
  CHEESE = 'cheese',
  CHOCOLATE = 'chocolate',
}

const enum TestProduct {
  VINAIGRETTE = 'vinaigrette',
  CHOCOLATE_BAR = 'chocolateBar',
}

const flourEmissionFactor = getTestEmissionFactor(TestEmissionFactor.FLOUR);
const hamEmissionFactor = getTestEmissionFactor(TestEmissionFactor.HAM);
const oliveOilEmissionFactor = getTestEmissionFactor(
  TestEmissionFactor.OLIVE_OIL,
);
const tomatoEmissionFactor = getTestEmissionFactor(TestEmissionFactor.TOMATO);
const cheeseEmissionFactor = getTestEmissionFactor(TestEmissionFactor.CHEESE);

describe('FoodProductService', () => {
  let foodProductService: FoodProductService;
  let carbonEmissionFactorsService: CarbonEmissionFactorsService;

  beforeAll(async () => {
    await dataSource.initialize();
    carbonEmissionFactorsService = new CarbonEmissionFactorsService(
      dataSource.getRepository(CarbonEmissionFactor),
    );
    foodProductService = new FoodProductService(
      dataSource.getRepository(FoodProduct),
      carbonEmissionFactorsService,
      new UtilsService(),
    );
  });

  beforeEach(async () => {
    await GreenlyDataSource.cleanDatabase();
    await dataSource
      .getRepository(CarbonEmissionFactor)
      .save(oliveOilEmissionFactor);

    await dataSource.getRepository(FoodProduct).save(vinaigrette);
  });

  describe('findByName', () => {
    it('should retrieve food product by name', async () => {
      const retrievedVinaigrette = await foodProductService.findByName(
        TestProduct.VINAIGRETTE,
      );

      expect(retrievedVinaigrette.name).toBe(vinaigrette.name);
      expect(retrievedVinaigrette.carbonFootprint).toBe(
        vinaigrette.carbonFootprint,
      );
    });

    it('should throw error if no product is found', async () => {
      await expect(
        foodProductService.findByName(TestEmissionFactor.HAM),
      ).rejects.toThrow(`Food Product ${TestEmissionFactor.HAM} not found`);
    });
  });

  describe('save', () => {
    it('should save new product', async () => {
      const chocolateBar = new FoodProduct({
        name: TestProduct.CHOCOLATE_BAR,
        carbonFootprint: 0.4,
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
      });

      await foodProductService.save(chocolateBar);
      const retrievedChocolateBar = await dataSource
        .getRepository(FoodProduct)
        .findOne({ where: { name: 'chocolateBar' } });
      expect(retrievedChocolateBar?.name).toBe(TestProduct.CHOCOLATE_BAR);
    });

    it('should throw conflict error if the product already exists', async () => {
      const sameVinaigrette = new FoodProduct({
        name: TestProduct.VINAIGRETTE,
        ingredients: [],
      });
      await expect(foodProductService.save(sameVinaigrette)).rejects.toThrow(
        `Food Product '${vinaigrette.name}' already exists`,
      );
    });

    it('should throw error if the product is wrong', async () => {
      const wrongName = new FoodProduct({
        name: null!,
      });

      await expect(foodProductService.save(wrongName)).rejects.toThrow();
    });
  });

  describe('createFoodProduct', () => {
    it('should create a food product with null value if no ingredients are known', async () => {
      const chocolateBarDto: CreateFoodProductDto = {
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

      const foodProduct =
        await foodProductService.createFoodProduct(chocolateBarDto);
      expect(foodProduct.name).toBe('chocolateBar');
      expect(foodProduct.carbonFootprint).toBeNull();
    });

    it('should create a food product with null value if one ingredient is not known', async () => {
      const vinaigretteDto: CreateFoodProductDto = {
        name: 'vinaigrette2',
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

      const foodProduct =
        await foodProductService.createFoodProduct(vinaigretteDto);
      expect(foodProduct.name).toBe('vinaigrette2');
      expect(foodProduct.carbonFootprint).toBeNull();
    });

    it('should create a new food product correctly', async () => {
      await carbonEmissionFactorsService.save([
        hamEmissionFactor,
        cheeseEmissionFactor,
        tomatoEmissionFactor,
        flourEmissionFactor,
      ]);

      const hamCheesePizzaDto: CreateFoodProductDto = {
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

      const foodProduct =
        await foodProductService.createFoodProduct(hamCheesePizzaDto);
      expect(foodProduct.name).toBe('hamCheesePizza');
      expect(foodProduct.carbonFootprint).toBeGreaterThan(0);
    });
  });
});

afterAll(async () => {
  await dataSource.destroy();
});
