import { describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const auth = vi.fn()
  const payload = { auth }
  return {
    auth,
    payload,
    getPayload: vi.fn(async () => payload),
    checkPublicRateLimit: vi.fn(),
    getPublicInvitation: vi.fn(),
  }
})

vi.mock('payload', () => ({ getPayload: mocks.getPayload }))
vi.mock('@/payload.config', () => ({ default: { slug: 'config' } }))
vi.mock('@/lib/volunteer-registration/rate-limit', () => ({
  checkPublicRateLimit: mocks.checkPublicRateLimit,
}))
vi.mock('@/lib/volunteer-registration/service', () => ({
  getPublicInvitation: mocks.getPublicInvitation,
}))
vi.mock('@upstash/ratelimit', () => ({ Ratelimit: class {} }))
vi.mock('@upstash/redis', () => ({ Redis: class {} }))

describe('public volunteer HTTP dispatcher', () => {
  it('passes the token and request metadata to the public invitation service', async () => {
    mocks.checkPublicRateLimit.mockResolvedValue({ success: true, remaining: 29 })
    mocks.getPublicInvitation.mockResolvedValue({ invitationId: 'invitation-1' })

    const { getPublicInvitationHttp } = await import('@/lib/volunteer-registration/http')
    const response = await getPublicInvitationHttp(
      new Request('https://www.viralatinhas.com/api/volunteer-invitations/token-123/public', {
        headers: { 'x-forwarded-for': '203.0.113.10', 'user-agent': 'test-agent/1.0' },
      }),
      'token-123',
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ invitationId: 'invitation-1' })
    expect(mocks.getPublicInvitation).toHaveBeenCalledWith(
      expect.objectContaining({ ipAddress: '203.0.113.10', userAgent: 'test-agent/1.0' }),
      'token-123',
    )
  })
})

describe('authenticatePayloadRequest', () => {
  it('authenticates with the enriched request and returns the Payload context', async () => {
    const user = { id: 'admin-1', role: 'Admin' }
    const request = new Request('https://example.test/admin', {
      headers: { authorization: 'Bearer token' },
    })
    mocks.auth.mockImplementationOnce(async (args: { headers: Headers; req: Request & { payload: unknown } }) => {
      expect(args.headers).toBe(request.headers)
      expect(args.req).toBe(request)
      expect(args.req.payload).toBe(mocks.payload)
      return { user }
    })

    const { authenticatePayloadRequest } = await import('@/lib/volunteer-registration/auth')
    const result = await authenticatePayloadRequest(request)

    expect(mocks.getPayload).toHaveBeenCalledWith({ config: { slug: 'config' } })
    expect(result.req).toBe(request)
    expect(result.req.payload).toBe(mocks.payload)
    expect(result.payload).toBe(mocks.payload)
    expect(result.user).toBe(user)
  })
})
