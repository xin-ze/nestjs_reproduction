import { MigrationInterface, QueryRunner } from "typeorm";

export class createMarkdownActivities1709470385949
  implements MigrationInterface {
  name = "createMarkdownActivities1709470385949";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "markdown_activities_type_enum" AS ENUM('0', '1', '2')`);
    await queryRunner.query(
      `CREATE TABLE "markdown_activities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."markdown_activities_type_enum" NOT NULL, "markdown_id" character varying NOT NULL, "old_content" text, "user_id" character varying NOT NULL, "user_info" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fe6cf1436c743e705a3a35d4179" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "markdown_activities"`);
    await queryRunner.query(`DROP TYPE "markdown_activities_type_enum"`);
  }
}
