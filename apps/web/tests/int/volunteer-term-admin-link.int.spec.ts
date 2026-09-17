import { describe, expect, it } from 'vitest'

import { Volunteers } from '@/collections/Volunteers'

describe('vínculo do termo no cadastro do voluntário', () => {
  it('expõe o histórico de aceites como junção somente leitura', () => {
    const termAcceptances = Volunteers.fields.find((field: any) => field.name === 'termAcceptances') as any

    expect(termAcceptances).toBeTruthy()
    expect(termAcceptances).toMatchObject({
      type: 'join',
      collection: 'volunteer-term-acceptances',
      on: 'volunteer',
      admin: {
        defaultColumns: ['termVersion', 'acceptedAt', 'contentHashAtAcceptance'],
      },
    })
    expect(termAcceptances.access.read({ req: { user: { role: 'Admin' } } })).toBe(true)
    expect(termAcceptances.access.read({ req: { user: { role: 'VOLUNTEER_MANAGER' } } })).toBe(false)
  })
})
