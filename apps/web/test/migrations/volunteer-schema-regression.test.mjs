import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const migrationsDirectory = join(dirname(fileURLToPath(import.meta.url)), '../../src/migrations')

test('keeps the volunteers whatsapp column compatible with production', async () => {
  const migrationFiles = (await readdir(migrationsDirectory)).filter((file) => file.endsWith('.ts'))
  const migrationSources = await Promise.all(
    migrationFiles.map((file) => readFile(join(migrationsDirectory, file), 'utf8')),
  )

  assert.ok(
    migrationSources.some((source) =>
      /ALTER TABLE\s+"volunteers"\s+ADD COLUMN IF NOT EXISTS\s+"whatsapp"/.test(source),
    ),
    'Expected an incremental migration that creates volunteers.whatsapp when absent',
  )
})

test('keeps the legacy temporary-home fields compatible with production', async () => {
  const migrationFiles = (await readdir(migrationsDirectory)).filter((file) => file.endsWith('.ts'))
  const migrationSources = await Promise.all(
    migrationFiles.map((file) => readFile(join(migrationsDirectory, file), 'utf8')),
  )
  const migrationSource = migrationSources.join('\n')

  assert.match(
    migrationSource,
    /ALTER TABLE\s+"volunteers"\s+ADD COLUMN IF NOT EXISTS\s+"is_l_t"\s+boolean/,
    'Expected an incremental migration that creates volunteers.is_l_t when absent',
  )
  assert.match(
    migrationSource,
    /ALTER TABLE\s+"volunteers"\s+ADD COLUMN IF NOT EXISTS\s+"capacidade_l_t"\s+numeric/,
    'Expected an incremental migration that creates volunteers.capacidade_l_t when absent',
  )
})
