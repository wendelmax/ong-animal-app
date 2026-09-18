import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_volunteers_funcao" AS ENUM(
        'Resgate',
        'Lar Temporário',
        'Transporte',
        'Eventos',
        'Administrativo',
        'Marketing'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    ALTER TABLE "volunteers"
    ADD COLUMN IF NOT EXISTS "endereco" varchar;

    ALTER TABLE "volunteers"
    ADD COLUMN IF NOT EXISTS "cidade" varchar DEFAULT 'Sumaré';

    ALTER TABLE "volunteers"
    ADD COLUMN IF NOT EXISTS "funcao" "enum_volunteers_funcao";

    ALTER TABLE "volunteers"
    ADD COLUMN IF NOT EXISTS "disponibilidade" varchar;

    ALTER TABLE "volunteers"
    ADD COLUMN IF NOT EXISTS "ativo" boolean DEFAULT true;
  `)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // This is a compatibility migration. Do not remove columns during rollback:
  // they may have existed before this migration ran in a partially migrated database.
}
