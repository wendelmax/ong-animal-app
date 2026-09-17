import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "volunteer_term_acceptances" ADD COLUMN IF NOT EXISTS "content_snapshot" varchar`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "volunteer_term_acceptances" DROP COLUMN IF EXISTS "content_snapshot"`)
}
