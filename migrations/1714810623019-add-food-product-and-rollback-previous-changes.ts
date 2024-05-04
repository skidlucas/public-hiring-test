import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFoodProductAndRollbackPreviousChanges1714810623019
  implements MigrationInterface
{
  name = 'AddFoodProductAndRollbackPreviousChanges1714810623019';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "food_product" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "carbonFootprint" double precision, "ingredients" jsonb NOT NULL, CONSTRAINT "UQ_0c26a9b7c69877f3aed9ba4796a" UNIQUE ("name"), CONSTRAINT "PK_398d3643b03f14a730b364c7515" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "carbon_emission_factors" DROP CONSTRAINT "UQ_57096ef561d0d6c1c3570613211"`,
    );
    await queryRunner.query(
      `ALTER TABLE "carbon_emission_factors" ALTER COLUMN "emissionCO2eInKgPerUnit" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "carbon_emission_factors" ALTER COLUMN "emissionCO2eInKgPerUnit" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "carbon_emission_factors" ADD CONSTRAINT "UQ_57096ef561d0d6c1c3570613211" UNIQUE ("name")`,
    );
    await queryRunner.query(`DROP TABLE "food_product"`);
  }
}
