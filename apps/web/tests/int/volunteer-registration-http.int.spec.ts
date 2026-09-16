import { describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getPayload: vi.fn(),
  checkPublicRateLimit: vi.fn(),
  getPublicInvitation: vi.fn(),
}))

vi.mock('payload', () => ({ getPayload: mocks.getPayload }))
vi.mock('@/payload.config', () => ({ default: {} }))
vi.mock('@/lib/volunteer-registration/rate-limit', () => ({ checkPublicRateLimit: mocks.checkPublicRateLimit }))
vi.mock('@/lib/volunteer-registration/service', () => ({
  getPublicInvitation: mocks.getPublicInvitation,
}))

describe('public volunteer HTTP dispatcher', () => {
  it('passes the token and request metadata to the public invitation service', async () => {
    mocks.getPayload.mockResolvedValue({ id: 'payload' })
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

