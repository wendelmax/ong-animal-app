import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const appRoot = resolve(import.meta.dirname, '../..')
const configSource = () => readFileSync(resolve(appRoot, 'src/payload.config.ts'), 'utf8')
const migrationName = readdirSync(resolve(appRoot, 'src/migrations')).find((name) =>
  name.endsWith('_production_schema_compatibility.ts'),
)
const migrationPath = migrationName ? resolve(appRoot, 'src/migrations', migrationName) : ''

describe('production schema configuration', () => {
  it('uses versioned Payload migrations instead of production push', () => {
    expect(configSource()).toContain("migrationDir: path.resolve(dirname, 'migrations')")
    expect(configSource()).toContain("push: process.env.NODE_ENV !== 'production'")
    expect(existsSync(migrationPath)).toBe(true)

    const migrationSource = existsSync(migrationPath) ? readFileSync(migrationPath, 'utf8') : ''
    const excerptMigration = readFileSync(
      resolve(appRoot, 'src/migrations/20260527_031700_add_excerpt.ts'),
      'utf8',
    )
    const migrationChain = `${excerptMigration}\n${migrationSource}`
    expect(migrationChain).toContain('posts')
    expect(migrationChain).toContain('slug')
    expect(migrationChain).toContain('excerpt')
    expect(migrationChain).toContain('transactions')
    expect(migrationChain).toContain('visivel_no_site')
    expect(migrationSource).toContain('volunteer_invitations')
    expect(migrationSource).toContain('volunteer_files')
  })

  it('runs migrations before the Vercel build', () => {
    const rootPackage = readFileSync(resolve(appRoot, '../../package.json'), 'utf8')
    const vercelConfig = readFileSync(resolve(appRoot, '../../vercel.json'), 'utf8')
    const appVercelConfig = readFileSync(resolve(appRoot, 'vercel.json'), 'utf8')

    expect(rootPackage).toContain('vercel-build')
    expect(vercelConfig).toContain('npm run vercel-build')
    expect(appVercelConfig).toContain('npm run vercel-build')
    expect(existsSync(resolve(appRoot, 'scripts/vercel-build.mjs'))).toBe(true)

    const buildScriptPath = resolve(appRoot, 'scripts/vercel-build.mjs')
    const buildScript = existsSync(buildScriptPath) ? readFileSync(buildScriptPath, 'utf8') : ''
    expect(buildScript).toContain("process.env.VERCEL_ENV === 'production'")
    expect(buildScript).toContain("run('migrate')")
  })

  it('configures a Payload storage adapter for media in Vercel', () => {
    const payloadConfig = configSource()
    const mediaConfig = readFileSync(resolve(appRoot, 'src/collections/Media.ts'), 'utf8')

    expect(payloadConfig).toContain('uploadthingStorage')
    expect(mediaConfig).not.toContain('beforeChange: [uploadToBlob]')
  })

  it('makes the compatibility migration rerunnable and keeps required evidence relationships', () => {
    const migrationSource = existsSync(migrationPath) ? readFileSync(migrationPath, 'utf8') : ''

    expect(migrationSource).toContain('CREATE TABLE IF NOT EXISTS')
    expect(migrationSource).toContain('ADD COLUMN IF NOT EXISTS')
    expect(migrationSource).toContain('CREATE INDEX IF NOT EXISTS')
    expect(migrationSource).toContain('duplicate_object')
    expect(migrationSource).toContain(
      'volunteer_files_invitation_id_volunteer_invitations_id_fk\" FOREIGN KEY (\"invitation_id\") REFERENCES \"public\".\"volunteer_invitations\"(\"id\") ON DELETE restrict',
    )
    expect(migrationSource).toContain(
      'volunteer_term_acceptances_volunteer_id_volunteers_id_fk\" FOREIGN KEY (\"volunteer_id\") REFERENCES \"public\".\"volunteers\"(\"id\") ON DELETE restrict',
    )
    expect(migrationSource).toContain(
      'volunteer_term_acceptances_term_version_id_membership_term_versions_id_fk\" FOREIGN KEY (\"term_version_id\") REFERENCES \"public\".\"membership_term_versions\"(\"id\") ON DELETE restrict',
    )
    expect(migrationSource).not.toContain('DROP TABLE \"volunteer_invitations\" CASCADE')
    expect(migrationSource).not.toContain('DROP TABLE \"volunteer_files\" CASCADE')
  })
})
