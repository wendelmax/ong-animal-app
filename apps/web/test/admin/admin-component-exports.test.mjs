import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const componentsDirectory = join(dirname(fileURLToPath(import.meta.url)), '../../src/components/Admin')

test('exports admin components as defaults for the generated Payload import map', async () => {
  const componentFiles = ['VolunteerInvitationActions.tsx', 'VolunteerReviewActions.tsx']
  const sources = await Promise.all(
    componentFiles.map((file) => readFile(join(componentsDirectory, file), 'utf8')),
  )

  for (const [index, source] of sources.entries()) {
    assert.match(
      source,
      /export default (VolunteerInvitationActions|VolunteerReviewActions)/,
      `${componentFiles[index]} must provide a default export for Payload`,
    )
  }
})
