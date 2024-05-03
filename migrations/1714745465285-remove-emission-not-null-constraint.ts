import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveEmissionNotNullConstraint1714745465285
  implements MigrationInterface
{
  name = 'RemoveEmissionNotNullConstraint1714745465285';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "carbon_emission_factors" ALTER COLUMN "emissionCO2eInKgPerUnit" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "carbon_emission_factors" ADD CONSTRAINT "UQ_57096ef561d0d6c1c3570613211" UNIQUE ("name")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "carbon_emission_factors" ALTER COLUMN "emissionCO2eInKgPerUnit" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "carbon_emission_factors" DROP CONSTRAINT "UQ_57096ef561d0d6c1c3570613211"`,
    );
  }
}
