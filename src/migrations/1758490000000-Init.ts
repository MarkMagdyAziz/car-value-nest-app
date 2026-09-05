import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Baseline schema for the production (Postgres) database.
 *
 * When the app is first deployed, `user` and `report` tables do not exist.
 * This migration creates them to match the User/Report entities (including the
 * `admin` column used by AdminGuard). Users created by the app carry a
 * JS-generated random id (< 1,000,000), and Reports rely on the DB sequence,
 * so the user id sequence is restarted above the JS-random range to avoid
 * future collisions with inserts that omit an explicit id.
 */
export class Init1758490000000 implements MigrationInterface {
  name = 'Init1758490000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "admin" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_user" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "report" ("id" SERIAL NOT NULL, "approved" boolean NOT NULL DEFAULT false, "price" integer NOT NULL, "make" character varying NOT NULL, "model" character varying NOT NULL, "year" integer NOT NULL, "lng" integer NOT NULL, "lat" integer NOT NULL, "mileage" integer NOT NULL, "userId" integer, CONSTRAINT "PK_report" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "report" ADD CONSTRAINT "FK_report_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_report_userId" ON "report" ("userId")`,
    );
    await queryRunner.query(
      `ALTER SEQUENCE "user_id_seq" RESTART WITH 1000000`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_report_userId"`);
    await queryRunner.query(
      `ALTER TABLE "report" DROP CONSTRAINT "FK_report_user"`,
    );
    await queryRunner.query(`DROP TABLE "report"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
