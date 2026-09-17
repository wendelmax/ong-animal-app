import { describe, expect, it, vi } from 'vitest'

const { auth, getPayload } = vi.hoisted(() => {
  const auth = vi.fn()
  return { auth, getPayload: vi.fn(async () => ({ auth })) }
})

vi.mock('payload', () => ({ getPayload }))
vi.mock('../../src/payload.config', () => ({ default: { slug: 'config' } }))

import { authenticatePayloadRequest } from '../../src/lib/volunteer-registration/auth'

describe('authenticatePayloadRequest', () => {
  it('authenticates the request and returns the Payload context', async () => {
    const user = { id: 'admin-1', role: 'Admin' }
    auth.mockResolvedValueOnce({ user })
    const request = new Request('https://example.test/admin', {
      headers: { authorization: 'Bearer token' },
    })

    const result = await authenticatePayloadRequest(request)

    expect(getPayload).toHaveBeenCalledWith({ config: { slug: 'config' } })
    expect(auth).toHaveBeenCalledWith({ headers: request.headers, req: result.req })
    expect(result.req).toBe(request)
    expect(result.req.payload).toBe(result.payload)
    expect(result.user).toBe(user)
  })
})
