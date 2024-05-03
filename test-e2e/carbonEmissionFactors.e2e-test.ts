import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { dataSource, GreenlyDataSource } from '../config/dataSource';
import { AppModule } from '../src/app.module';
import { CarbonEmissionFactor } from '../src/carbonEmissionFactor/carbonEmissionFactor.entity';
import { getTestEmissionFactor } from '../src/seed-dev-data';
import {
  CreateCarbonEmissionFactorFromProductDto,
  FoodIngredientDto,
} from '../src/carbonEmissionFactor/dto/create-carbonEmissionFactor.dto';

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

describe('CarbonEmissionFactorsController', () => {
  let app: INestApplication;
  let defaultCarbonEmissionFactors: CarbonEmissionFactor[];

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

    defaultCarbonEmissionFactors = await dataSource
      .getRepository(CarbonEmissionFactor)
      .find();
  });

  it('GET /carbon-emission-factors', async () => {
    return request(app.getHttpServer())
      .get('/carbon-emission-factors')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual(defaultCarbonEmissionFactors);
      });
  });

  it('POST /carbon-emission-factors', async () => {
    const carbonEmissionFactorArgs = {
      name: 'Test Carbon Emission Factor',
      unit: 'kg',
      emissionCO2eInKgPerUnit: 12,
      source: 'Test Source',
    };
    return request(app.getHttpServer())
      .post('/carbon-emission-factors')
      .send([carbonEmissionFactorArgs])
      .expect(201)
      .expect(({ body }) => {
        expect(body.length).toEqual(1);
        expect(body[0]).toMatchObject(carbonEmissionFactorArgs);
      });
  });

  it('GET /carbon-emission-factors/ham', async () => {
    const ham = getTestEmissionFactor(TestEmissionFactor.HAM);
    const expectedHamCarbonEmission = {
      emissionCO2eInKgPerUnit: ham.emissionCO2eInKgPerUnit,
      name: ham.name,
      source: ham.source,
    };

    return request(app.getHttpServer())
      .get('/carbon-emission-factors/ham')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual(expectedHamCarbonEmission);
      });
  });

  it('GET /carbon-emission-factors/chocolate', async () => {
    return request(app.getHttpServer())
      .get('/carbon-emission-factors/chocolate')
      .expect(404)
      .expect(({ body }) => {
        expect(body).toEqual({
          error: 'Not Found',
          message: 'Carbon Emission factor chocolate not found',
          statusCode: 404,
        });
      });
  });

  describe('POST /carbon-emission-factors/product', () => {
    it('should create a carbon emission factor successfully with computed emission', async () => {
      const hamAndBeefDto: CreateCarbonEmissionFactorFromProductDto = {
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

      const expectedCarbonEmissionFactor = {
        name: 'hamAndBeef',
        emissionCO2eInKgPerUnit: 2.12,
        source: 'computed',
        unit: 'kg',
      };

      return request(app.getHttpServer())
        .post('/carbon-emission-factors/product')
        .send(hamAndBeefDto)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toEqual(
            expect.objectContaining(expectedCarbonEmissionFactor),
          );
        });
    });

    it('should create a carbon emission factor successfully with null emission because of a missing ingredient', async () => {
      const hamSandwich: CreateCarbonEmissionFactorFromProductDto = {
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

      const expectedCarbonEmissionFactor = {
        name: 'hamSandwich',
        emissionCO2eInKgPerUnit: null,
        source: 'computed',
        unit: 'kg',
      };

      return request(app.getHttpServer())
        .post('/carbon-emission-factors/product')
        .send(hamSandwich)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toEqual(
            expect.objectContaining(expectedCarbonEmissionFactor),
          );
        });
    });

    it('should throw a 409 error because of an existing carbon emission factor', async () => {
      const hamSandwich: CreateCarbonEmissionFactorFromProductDto = {
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
        .post('/carbon-emission-factors/product')
        .send(hamSandwich);

      return request(app.getHttpServer())
        .post('/carbon-emission-factors/product')
        .send(hamSandwich)
        .expect(409);
    });

    it('should return an error if the product name is missing', async () => {
      const hamSandwich: Partial<CreateCarbonEmissionFactorFromProductDto> = {
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
        .post('/carbon-emission-factors/product')
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
      const hamSandwich: Partial<CreateCarbonEmissionFactorFromProductDto> = {
        name: 'hamSandwich',
      };

      const res = await request(app.getHttpServer())
        .post('/carbon-emission-factors/product')
        .send(hamSandwich);

      expect(res.status).toEqual(400);
      expect(res.body).toEqual(
        expect.objectContaining({
          message: ['ingredients must be an array'],
        }),
      );
    });

    it('should return an error if the product ingredients are incomplete', async () => {
      const ingredients: Partial<FoodIngredientDto>[] = [
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

      const hamSandwich: Partial<CreateCarbonEmissionFactorFromProductDto> = {
        name: 'hamSandwich',
        ingredients: ingredients as FoodIngredientDto[],
      };

      const res = await request(app.getHttpServer())
        .post('/carbon-emission-factors/product')
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
