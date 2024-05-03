import { MigrationInterface, QueryRunner } from 'typeorm';

export class CarbonEmissionFactor1708367794381 implements MigrationInterface {
  name = 'CarbonEmissionFactor1708367794381';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "carbon_emission_factors" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "unit" character varying NOT NULL, "emissionCO2eInKgPerUnit" float NOT NULL, "source" character varying NOT NULL, CONSTRAINT "PK_e6a201ea58a7b4cdec0ca1c0c61" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "carbon_emission_factors"`);
  }
}
