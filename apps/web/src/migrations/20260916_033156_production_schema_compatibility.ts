import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_volunteers_status" AS ENUM('PENDING_REVIEW', 'ACTIVE', 'REJECTED', 'RESIGNED', 'SUSPENDED');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      CREATE TYPE "public"."enum_volunteer_invitations_status" AS ENUM('ACTIVE', 'EXPIRED', 'EXHAUSTED', 'REVOKED');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      CREATE TYPE "public"."enum_volunteer_files_purpose" AS ENUM('PERSONAL_PHOTO', 'IDENTITY_DOCUMENT');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      CREATE TYPE "public"."enum_volunteer_files_storage_provider" AS ENUM('R2');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      CREATE TYPE "public"."enum_volunteer_files_upload_status" AS ENUM('PENDING', 'UPLOADED', 'REJECTED', 'DELETED');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      CREATE TYPE "public"."enum_membership_term_versions_status" AS ENUM('DRAFT', 'PUBLISHED', 'RETIRED');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      CREATE TYPE "public"."enum_audit_events_actor_type" AS ENUM('ADMIN', 'PUBLIC_INVITATION', 'SYSTEM');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    ALTER TYPE "public"."enum_users_role" ADD VALUE IF NOT EXISTS 'VOLUNTEER_MANAGER' BEFORE 'Financeiro';
    ALTER TYPE "public"."enum_users_role" ADD VALUE IF NOT EXISTS 'COMPLIANCE_OFFICER' BEFORE 'Financeiro';
    ALTER TYPE "public"."enum_users_role" ADD VALUE IF NOT EXISTS 'LEGAL_DIRECTOR' BEFORE 'Financeiro';

    CREATE TABLE IF NOT EXISTS "volunteer_invitations" (
      "id" serial PRIMARY KEY NOT NULL,
      "token_hash" varchar,
      "created_by_id" integer,
      "expires_at" timestamp(3) with time zone NOT NULL,
      "max_uses" numeric DEFAULT 1 NOT NULL,
      "used_count" numeric DEFAULT 0 NOT NULL,
      "status" "enum_volunteer_invitations_status" DEFAULT 'ACTIVE' NOT NULL,
      "last_used_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "volunteer_files" (
      "id" serial PRIMARY KEY NOT NULL,
      "volunteer_id" integer,
      "invitation_id" integer NOT NULL,
      "submission_id" varchar NOT NULL,
      "purpose" "enum_volunteer_files_purpose" NOT NULL,
      "storage_provider" "enum_volunteer_files_storage_provider" DEFAULT 'R2' NOT NULL,
      "object_key" varchar NOT NULL,
      "mime_type" varchar NOT NULL,
      "size_bytes" numeric NOT NULL,
      "sha256" varchar NOT NULL,
      "upload_status" "enum_volunteer_files_upload_status" DEFAULT 'PENDING' NOT NULL,
      "uploaded_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "membership_term_versions" (
      "id" serial PRIMARY KEY NOT NULL,
      "version" varchar NOT NULL,
      "content" varchar NOT NULL,
      "content_hash" varchar NOT NULL,
      "document_key" varchar,
      "effective_from" timestamp(3) with time zone NOT NULL,
      "effective_until" timestamp(3) with time zone,
      "status" "enum_membership_term_versions_status" DEFAULT 'DRAFT' NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "volunteer_term_acceptances" (
      "id" serial PRIMARY KEY NOT NULL,
      "volunteer_id" integer NOT NULL,
      "term_version_id" integer NOT NULL,
      "accepted_at" timestamp(3) with time zone NOT NULL,
      "ip_address" varchar NOT NULL,
      "user_agent" varchar NOT NULL,
      "content_hash_at_acceptance" varchar NOT NULL,
      "statement" varchar NOT NULL,
      "signed_document" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "audit_events" (
      "id" serial PRIMARY KEY NOT NULL,
      "event_type" varchar NOT NULL,
      "occurred_at" timestamp(3) with time zone NOT NULL,
      "actor_type" "enum_audit_events_actor_type" NOT NULL,
      "actor_id" varchar,
      "actor_role" varchar,
      "target_type" varchar NOT NULL,
      "target_id" varchar NOT NULL,
      "ip_address" varchar,
      "user_agent" varchar,
      "metadata" jsonb,
      "legal_ground" varchar,
      "target_norm" varchar,
      "target_entity" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "visivel_no_site" boolean DEFAULT true;
    ALTER TABLE "volunteers" ADD COLUMN IF NOT EXISTS "status" "enum_volunteers_status" DEFAULT 'ACTIVE' NOT NULL;
    ALTER TABLE "volunteers" ADD COLUMN IF NOT EXISTS "data_nascimento" timestamp(3) with time zone;
    ALTER TABLE "volunteers" ADD COLUMN IF NOT EXISTS "rg" varchar;
    ALTER TABLE "volunteers" ADD COLUMN IF NOT EXISTS "orgao_emissor" varchar;
    ALTER TABLE "volunteers" ADD COLUMN IF NOT EXISTS "cpf_encrypted" varchar;
    ALTER TABLE "volunteers" ADD COLUMN IF NOT EXISTS "cpf_blind_index" varchar;
    ALTER TABLE "volunteers" ADD COLUMN IF NOT EXISTS "cpf_masked" varchar;
    ALTER TABLE "volunteers" ADD COLUMN IF NOT EXISTS "email" varchar;
    ALTER TABLE "volunteers" ADD COLUMN IF NOT EXISTS "endereco_rua" varchar;
    ALTER TABLE "volunteers" ADD COLUMN IF NOT EXISTS "endereco_bairro" varchar;
    ALTER TABLE "volunteers" ADD COLUMN IF NOT EXISTS "cep" varchar;
    ALTER TABLE "volunteers" ADD COLUMN IF NOT EXISTS "area_atuacao" varchar;
    ALTER TABLE "volunteers" ADD COLUMN IF NOT EXISTS "funcao_especifica" varchar;
    ALTER TABLE "volunteers" ADD COLUMN IF NOT EXISTS "data_ingresso" timestamp(3) with time zone;
    ALTER TABLE "volunteers" ADD COLUMN IF NOT EXISTS "horas_medias_mes" numeric;
    ALTER TABLE "volunteers" ADD COLUMN IF NOT EXISTS "source_invitation_id" integer;
    ALTER TABLE "volunteers" ADD COLUMN IF NOT EXISTS "submitted_at" timestamp(3) with time zone;
    ALTER TABLE "volunteers" ADD COLUMN IF NOT EXISTS "reviewed_at" timestamp(3) with time zone;
    ALTER TABLE "volunteers" ADD COLUMN IF NOT EXISTS "reviewed_by_id" integer;
    ALTER TABLE "volunteers" ADD COLUMN IF NOT EXISTS "rejection_reason" varchar;
    ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "slug" varchar;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "volunteer_invitations_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "volunteer_files_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "membership_term_versions_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "volunteer_term_acceptances_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "audit_events_id" integer;
    ALTER TABLE "volunteer_invitations" ALTER COLUMN "created_by_id" DROP NOT NULL;

    ALTER TABLE "volunteer_invitations" DROP CONSTRAINT IF EXISTS "volunteer_invitations_created_by_id_users_id_fk";
    ALTER TABLE "volunteer_files" DROP CONSTRAINT IF EXISTS "volunteer_files_volunteer_id_volunteers_id_fk";
    ALTER TABLE "volunteer_files" DROP CONSTRAINT IF EXISTS "volunteer_files_invitation_id_volunteer_invitations_id_fk";
    ALTER TABLE "volunteer_term_acceptances" DROP CONSTRAINT IF EXISTS "volunteer_term_acceptances_volunteer_id_volunteers_id_fk";
    ALTER TABLE "volunteer_term_acceptances" DROP CONSTRAINT IF EXISTS "volunteer_term_acceptances_term_version_id_membership_term_versions_id_fk";
    ALTER TABLE "volunteers" DROP CONSTRAINT IF EXISTS "volunteers_source_invitation_id_volunteer_invitations_id_fk";
    ALTER TABLE "volunteers" DROP CONSTRAINT IF EXISTS "volunteers_reviewed_by_id_users_id_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_volunteer_invitations_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_volunteer_files_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_membership_term_versions_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_volunteer_term_acceptances_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_audit_events_fk";

    ALTER TABLE "volunteer_invitations" ADD CONSTRAINT "volunteer_invitations_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "volunteer_files" ADD CONSTRAINT "volunteer_files_volunteer_id_volunteers_id_fk" FOREIGN KEY ("volunteer_id") REFERENCES "public"."volunteers"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "volunteer_files" ADD CONSTRAINT "volunteer_files_invitation_id_volunteer_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."volunteer_invitations"("id") ON DELETE restrict ON UPDATE no action;
    ALTER TABLE "volunteer_term_acceptances" ADD CONSTRAINT "volunteer_term_acceptances_volunteer_id_volunteers_id_fk" FOREIGN KEY ("volunteer_id") REFERENCES "public"."volunteers"("id") ON DELETE restrict ON UPDATE no action;
    ALTER TABLE "volunteer_term_acceptances" ADD CONSTRAINT "volunteer_term_acceptances_term_version_id_membership_term_versions_id_fk" FOREIGN KEY ("term_version_id") REFERENCES "public"."membership_term_versions"("id") ON DELETE restrict ON UPDATE no action;
    ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_source_invitation_id_volunteer_invitations_id_fk" FOREIGN KEY ("source_invitation_id") REFERENCES "public"."volunteer_invitations"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_volunteer_invitations_fk" FOREIGN KEY ("volunteer_invitations_id") REFERENCES "public"."volunteer_invitations"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_volunteer_files_fk" FOREIGN KEY ("volunteer_files_id") REFERENCES "public"."volunteer_files"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_membership_term_versions_fk" FOREIGN KEY ("membership_term_versions_id") REFERENCES "public"."membership_term_versions"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_volunteer_term_acceptances_fk" FOREIGN KEY ("volunteer_term_acceptances_id") REFERENCES "public"."volunteer_term_acceptances"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_events_fk" FOREIGN KEY ("audit_events_id") REFERENCES "public"."audit_events"("id") ON DELETE cascade ON UPDATE no action;

    CREATE UNIQUE INDEX IF NOT EXISTS "volunteer_invitations_token_hash_idx" ON "volunteer_invitations" USING btree ("token_hash");
    CREATE INDEX IF NOT EXISTS "volunteer_invitations_created_by_idx" ON "volunteer_invitations" USING btree ("created_by_id");
    CREATE INDEX IF NOT EXISTS "volunteer_invitations_updated_at_idx" ON "volunteer_invitations" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "volunteer_invitations_created_at_idx" ON "volunteer_invitations" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "volunteer_files_volunteer_idx" ON "volunteer_files" USING btree ("volunteer_id");
    CREATE INDEX IF NOT EXISTS "volunteer_files_invitation_idx" ON "volunteer_files" USING btree ("invitation_id");
    CREATE INDEX IF NOT EXISTS "volunteer_files_updated_at_idx" ON "volunteer_files" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "volunteer_files_created_at_idx" ON "volunteer_files" USING btree ("created_at");
    CREATE UNIQUE INDEX IF NOT EXISTS "membership_term_versions_version_idx" ON "membership_term_versions" USING btree ("version");
    CREATE INDEX IF NOT EXISTS "membership_term_versions_updated_at_idx" ON "membership_term_versions" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "membership_term_versions_created_at_idx" ON "membership_term_versions" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "volunteer_term_acceptances_volunteer_idx" ON "volunteer_term_acceptances" USING btree ("volunteer_id");
    CREATE INDEX IF NOT EXISTS "volunteer_term_acceptances_term_version_idx" ON "volunteer_term_acceptances" USING btree ("term_version_id");
    CREATE INDEX IF NOT EXISTS "volunteer_term_acceptances_updated_at_idx" ON "volunteer_term_acceptances" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "volunteer_term_acceptances_created_at_idx" ON "volunteer_term_acceptances" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "audit_events_updated_at_idx" ON "audit_events" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "audit_events_created_at_idx" ON "audit_events" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "volunteers_source_invitation_idx" ON "volunteers" USING btree ("source_invitation_id");
    CREATE INDEX IF NOT EXISTS "volunteers_reviewed_by_idx" ON "volunteers" USING btree ("reviewed_by_id");
    CREATE INDEX IF NOT EXISTS "posts_slug_idx" ON "posts" USING btree ("slug");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_volunteer_invitations_id_idx" ON "payload_locked_documents_rels" USING btree ("volunteer_invitations_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_volunteer_files_id_idx" ON "payload_locked_documents_rels" USING btree ("volunteer_files_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_membership_term_versions_i_idx" ON "payload_locked_documents_rels" USING btree ("membership_term_versions_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_volunteer_term_acceptances_idx" ON "payload_locked_documents_rels" USING btree ("volunteer_term_acceptances_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_audit_events_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_events_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "volunteers" DROP CONSTRAINT IF EXISTS "volunteers_source_invitation_id_volunteer_invitations_id_fk";
    ALTER TABLE "volunteers" DROP CONSTRAINT IF EXISTS "volunteers_reviewed_by_id_users_id_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_volunteer_invitations_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_volunteer_files_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_membership_term_versions_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_volunteer_term_acceptances_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_audit_events_fk";

    DROP INDEX IF EXISTS "volunteers_source_invitation_idx";
    DROP INDEX IF EXISTS "volunteers_reviewed_by_idx";
    DROP INDEX IF EXISTS "posts_slug_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_volunteer_invitations_id_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_volunteer_files_id_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_membership_term_versions_i_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_volunteer_term_acceptances_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_audit_events_id_idx";
    DROP INDEX IF EXISTS "volunteer_invitations_token_hash_idx";
    DROP INDEX IF EXISTS "volunteer_invitations_created_by_idx";
    DROP INDEX IF EXISTS "volunteer_invitations_updated_at_idx";
    DROP INDEX IF EXISTS "volunteer_invitations_created_at_idx";
    DROP INDEX IF EXISTS "volunteer_files_volunteer_idx";
    DROP INDEX IF EXISTS "volunteer_files_invitation_idx";
    DROP INDEX IF EXISTS "volunteer_files_updated_at_idx";
    DROP INDEX IF EXISTS "volunteer_files_created_at_idx";
    DROP INDEX IF EXISTS "membership_term_versions_version_idx";
    DROP INDEX IF EXISTS "membership_term_versions_updated_at_idx";
    DROP INDEX IF EXISTS "membership_term_versions_created_at_idx";
    DROP INDEX IF EXISTS "volunteer_term_acceptances_volunteer_idx";
    DROP INDEX IF EXISTS "volunteer_term_acceptances_term_version_idx";
    DROP INDEX IF EXISTS "volunteer_term_acceptances_updated_at_idx";
    DROP INDEX IF EXISTS "volunteer_term_acceptances_created_at_idx";
    DROP INDEX IF EXISTS "audit_events_updated_at_idx";
    DROP INDEX IF EXISTS "audit_events_created_at_idx";

    DROP TABLE IF EXISTS "volunteer_files";
    DROP TABLE IF EXISTS "volunteer_term_acceptances";
    DROP TABLE IF EXISTS "volunteer_invitations";
    DROP TABLE IF EXISTS "membership_term_versions";
    DROP TABLE IF EXISTS "audit_events";

    ALTER TABLE "transactions" DROP COLUMN IF EXISTS "visivel_no_site";
    ALTER TABLE "volunteers" DROP COLUMN IF EXISTS "status";
    ALTER TABLE "volunteers" DROP COLUMN IF EXISTS "data_nascimento";
    ALTER TABLE "volunteers" DROP COLUMN IF EXISTS "rg";
    ALTER TABLE "volunteers" DROP COLUMN IF EXISTS "orgao_emissor";
    ALTER TABLE "volunteers" DROP COLUMN IF EXISTS "cpf_encrypted";
    ALTER TABLE "volunteers" DROP COLUMN IF EXISTS "cpf_blind_index";
    ALTER TABLE "volunteers" DROP COLUMN IF EXISTS "cpf_masked";
    ALTER TABLE "volunteers" DROP COLUMN IF EXISTS "email";
    ALTER TABLE "volunteers" DROP COLUMN IF EXISTS "endereco_rua";
    ALTER TABLE "volunteers" DROP COLUMN IF EXISTS "endereco_bairro";
    ALTER TABLE "volunteers" DROP COLUMN IF EXISTS "cep";
    ALTER TABLE "volunteers" DROP COLUMN IF EXISTS "area_atuacao";
    ALTER TABLE "volunteers" DROP COLUMN IF EXISTS "funcao_especifica";
    ALTER TABLE "volunteers" DROP COLUMN IF EXISTS "data_ingresso";
    ALTER TABLE "volunteers" DROP COLUMN IF EXISTS "horas_medias_mes";
    ALTER TABLE "volunteers" DROP COLUMN IF EXISTS "source_invitation_id";
    ALTER TABLE "volunteers" DROP COLUMN IF EXISTS "submitted_at";
    ALTER TABLE "volunteers" DROP COLUMN IF EXISTS "reviewed_at";
    ALTER TABLE "volunteers" DROP COLUMN IF EXISTS "reviewed_by_id";
    ALTER TABLE "volunteers" DROP COLUMN IF EXISTS "rejection_reason";
    ALTER TABLE "posts" DROP COLUMN IF EXISTS "slug";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "volunteer_invitations_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "volunteer_files_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "membership_term_versions_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "volunteer_term_acceptances_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "audit_events_id";

    UPDATE "users"
      SET "role" = 'Voluntário'
      WHERE "role" IN ('VOLUNTEER_MANAGER', 'COMPLIANCE_OFFICER', 'LEGAL_DIRECTOR');
    ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;
    ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'Voluntário'::text;
    DROP TYPE IF EXISTS "public"."enum_users_role";
    CREATE TYPE "public"."enum_users_role" AS ENUM('Admin', 'Financeiro', 'Veterinário', 'Voluntário', 'Marketing');
    ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'Voluntário'::"public"."enum_users_role";
    ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."enum_users_role" USING "role"::"public"."enum_users_role";

    DROP TYPE IF EXISTS "public"."enum_volunteers_status";
    DROP TYPE IF EXISTS "public"."enum_volunteer_invitations_status";
    DROP TYPE IF EXISTS "public"."enum_volunteer_files_purpose";
    DROP TYPE IF EXISTS "public"."enum_volunteer_files_storage_provider";
    DROP TYPE IF EXISTS "public"."enum_volunteer_files_upload_status";
    DROP TYPE IF EXISTS "public"."enum_membership_term_versions_status";
    DROP TYPE IF EXISTS "public"."enum_audit_events_actor_type";
  `)
}
