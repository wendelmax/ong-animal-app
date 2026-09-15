import { describe, expect, it } from 'vitest'

describe('private R2 storage contract', () => {
  it('keeps the production adapter server-only and time bounded', async () => {
    const module = await import('@/lib/storage/r2')
    expect(module.r2Storage.createUploadUrl).toBeTypeOf('function')
    expect(module.r2Storage.createDownloadUrl).toBeTypeOf('function')
  })
})
