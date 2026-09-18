import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "volunteers"
    ADD COLUMN IF NOT EXISTS "is_l_t" boolean DEFAULT false;

    ALTER TABLE "volunteers"
    ADD COLUMN IF NOT EXISTS "capacidade_l_t" numeric;
  `)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // This is a compatibility migration. Do not remove columns during rollback:
  // they may have existed before this migration ran in a partially migrated database.
}
