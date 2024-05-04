import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { dataSource, GreenlyDataSource } from '../config/dataSource';
import { AppModule } from '../src/app.module';
import { CarbonEmissionFactor } from '../src/carbonEmissionFactor/carbonEmissionFactor.entity';
import { getTestEmissionFactor, vinaigrette } from '../src/seed-dev-data';
import { FoodProduct } from '../src/food-product/food-product.entity';
import { CreateFoodProductDto, FoodIngredient } from '../src/food-product/dto/food-product.dto';

const enum TestEmissionFactor {
  HAM = 'ham',
  BEEF = 'beef',
  BREAD = 'bread',
}

beforeAll(async () => {
  await dataSource.initialize();
});

afterAll(async () => {
  await dataSource.destroy();
});

describe('FoodProduct E2E', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await GreenlyDataSource.cleanDatabase();

    await dataSource
      .getRepository(CarbonEmissionFactor)
      .save([
        getTestEmissionFactor(TestEmissionFactor.HAM),
        getTestEmissionFactor(TestEmissionFactor.BEEF),
      ]);

    await dataSource.getRepository(FoodProduct).save(vinaigrette);
  });

  it('GET /food-products/vinaigrette', async () => {
    const expectedVinaigrette = {
      name: vinaigrette.name,
      carbonFootprint: vinaigrette.carbonFootprint,
    };

    return request(app.getHttpServer())
      .get('/food-products/vinaigrette')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual(expectedVinaigrette);
      });
  });

  it('GET /food-products/chocolateBar', async () => {
    return request(app.getHttpServer())
      .get('/food-products/chocolateBar')
      .expect(404)
      .expect(({ body }) => {
        expect(body).toEqual({
          error: 'Not Found',
          message: 'Food Product chocolateBar not found',
          statusCode: 404,
        });
      });
  });

  describe('POST /food-products', () => {
    it('should create a food product successfully with computed emission', async () => {
      const hamAndBeefDto: CreateFoodProductDto = {
        name: 'hamAndBeef',
        ingredients: [
          {
            name: TestEmissionFactor.HAM,
            quantity: 0.2,
            unit: 'kg',
          },
          {
            name: TestEmissionFactor.BEEF,
            quantity: 0.15,
            unit: 'kg',
          },
        ],
      };

      const expectedHamAndBeef = {
        name: 'hamAndBeef',
        carbonFootprint: 2.12,
      };

      return request(app.getHttpServer())
        .post('/food-products')
        .send(hamAndBeefDto)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toEqual(expect.objectContaining(expectedHamAndBeef));
        });
    });

    it('should create a food product successfully with null emission because of a missing ingredient', async () => {
      const hamSandwich: CreateFoodProductDto = {
        name: 'hamSandwich',
        ingredients: [
          {
            name: TestEmissionFactor.HAM,
            quantity: 0.2,
            unit: 'kg',
          },
          {
            name: TestEmissionFactor.BREAD,
            quantity: 0.2,
            unit: 'kg',
          },
        ],
      };

      const expectedHamSandwich = {
        name: 'hamSandwich',
        carbonFootprint: null,
      };

      return request(app.getHttpServer())
        .post('/food-products')
        .send(hamSandwich)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toEqual(expect.objectContaining(expectedHamSandwich));
        });
    });

    it('should throw a 409 error because of an existing food product', async () => {
      const hamSandwich: CreateFoodProductDto = {
        name: 'hamSandwich',
        ingredients: [
          {
            name: TestEmissionFactor.HAM,
            quantity: 0.2,
            unit: 'kg',
          },
          {
            name: TestEmissionFactor.BREAD,
            quantity: 0.2,
            unit: 'kg',
          },
        ],
      };

      // create the product the first time
      await request(app.getHttpServer())
        .post('/food-products')
        .send(hamSandwich);

      return request(app.getHttpServer())
        .post('/food-products')
        .send(hamSandwich)
        .expect(409);
    });

    it('should return an error if the product name is missing', async () => {
      const hamSandwich: Partial<CreateFoodProductDto> = {
        ingredients: [
          {
            name: TestEmissionFactor.HAM,
            quantity: 0.2,
            unit: 'kg',
          },
          {
            name: TestEmissionFactor.BREAD,
            quantity: 0.2,
            unit: 'kg',
          },
        ],
      };

      return request(app.getHttpServer())
        .post('/food-products')
        .send(hamSandwich)
        .expect(400)
        .expect(({ body }) => {
          expect(body).toEqual(
            expect.objectContaining({
              message: ['name must be a string'],
            }),
          );
        });
    });

    it('should return an error if the product ingredients are missing', async () => {
      const hamSandwich: Partial<CreateFoodProductDto> = {
        name: 'hamSandwich',
      };

      const res = await request(app.getHttpServer())
        .post('/food-products')
        .send(hamSandwich);

      expect(res.status).toEqual(400);
      expect(res.body).toEqual(
        expect.objectContaining({
          message: ['ingredients must be an array'],
        }),
      );
    });

    it('should return an error if the product ingredients are incomplete', async () => {
      const ingredients: Partial<FoodIngredient>[] = [
        {
          name: TestEmissionFactor.HAM,
          unit: 'kg',
        },
        {
          name: TestEmissionFactor.BREAD,
          quantity: 0.2,
        },
        {
          quantity: 0.2,
          unit: 'kg',
        },
      ];

      const hamSandwich: Partial<CreateFoodProductDto> = {
        name: 'hamSandwich',
        ingredients: ingredients as FoodIngredient[],
      };

      const res = await request(app.getHttpServer())
        .post('/food-products')
        .send(hamSandwich);

      expect(res.status).toEqual(400);
      expect(res.body).toEqual(
        expect.objectContaining({
          message: [
            'ingredients.0.quantity must be a number conforming to the specified constraints',
            'ingredients.1.unit must be a string',
            'ingredients.2.name must be a string',
          ],
        }),
      );
    });
  });
});
