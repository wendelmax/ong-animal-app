import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "volunteers"
    ADD COLUMN IF NOT EXISTS "whatsapp" varchar
  `)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // This is a compatibility migration. Do not remove the column during rollback:
  // it may have existed before this migration ran in a partially migrated database.
}
