import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Only add the column if it doesn't exist to prevent errors
  await db.execute(sql`
    ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "excerpt" varchar;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "posts" DROP COLUMN IF EXISTS "excerpt";
  `)
}
