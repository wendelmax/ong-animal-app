import { describe, expect, it } from 'vitest'

import { VolunteerInvitations } from '@/collections/VolunteerInvitations'

describe('volunteer invitation admin form', () => {
  it('preenche o usuário autenticado como criador ao criar um convite', async () => {
    const beforeChange = VolunteerInvitations.hooks?.beforeChange?.[0]

    expect(beforeChange).toBeTypeOf('function')

    const data = await (beforeChange as any)({
      operation: 'create',
      data: { expiresAt: '2026-10-01T00:00:00.000Z', maxUses: 1, status: 'ACTIVE' },
      req: { user: { id: 'user-test-123' } },
    })

    expect(data.createdBy).toBe('user-test-123')
  })
})
