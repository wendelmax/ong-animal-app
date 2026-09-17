import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "volunteers" ADD COLUMN IF NOT EXISTS "data_desligamento" timestamp(3) with time zone`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "volunteers" DROP COLUMN IF EXISTS "data_desligamento"`)
}
