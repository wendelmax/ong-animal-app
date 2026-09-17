import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getPayload } from 'payload'
import config from '@/payload.config'

const describeWithDatabase = describe.skipIf(!process.env.DATABASE_URL)

describeWithDatabase('membership term immutability', () => {
  let payload: any
  const ids: number[] = []

  beforeAll(async () => { payload = await getPayload({ config }) })
  afterAll(async () => {
    for (const id of ids) await payload.delete({ collection: 'membership-term-versions', id, overrideAccess: true }).catch(() => undefined)
  })

  it('keeps published and retired terms immutable while drafts remain editable', async () => {
    const draft = await payload.create({ collection: 'membership-term-versions', data: { version: `draft-${randomUUID()}`, content: 'rascunho', effectiveFrom: new Date().toISOString(), status: 'DRAFT' }, overrideAccess: true })
    ids.push(draft.id)
    const editedDraft = await payload.update({ collection: 'membership-term-versions', id: draft.id, data: { content: 'rascunho editado' }, overrideAccess: true })
    expect(editedDraft.content).toBe('rascunho editado')

    const published = await payload.create({ collection: 'membership-term-versions', data: { version: `published-${randomUUID()}`, content: 'conteúdo publicado', effectiveFrom: new Date().toISOString(), status: 'PUBLISHED' }, overrideAccess: true })
    ids.push(published.id)
    await expect(payload.update({ collection: 'membership-term-versions', id: published.id, data: { content: 'conteúdo alterado' }, overrideAccess: true })).rejects.toThrow('TERM_VERSION_IMMUTABLE')
    await expect(payload.delete({ collection: 'membership-term-versions', id: published.id, overrideAccess: true })).rejects.toThrow('TERM_VERSION_IMMUTABLE')

    const retired = await payload.create({ collection: 'membership-term-versions', data: { version: `retired-${randomUUID()}`, content: 'conteúdo retirado', effectiveFrom: new Date().toISOString(), status: 'RETIRED' }, overrideAccess: true })
    ids.push(retired.id)
    await expect(payload.update({ collection: 'membership-term-versions', id: retired.id, data: { content: 'conteúdo alterado' }, overrideAccess: true })).rejects.toThrow('TERM_VERSION_IMMUTABLE')
    await expect(payload.delete({ collection: 'membership-term-versions', id: retired.id, overrideAccess: true })).rejects.toThrow('TERM_VERSION_IMMUTABLE')
  })
})
