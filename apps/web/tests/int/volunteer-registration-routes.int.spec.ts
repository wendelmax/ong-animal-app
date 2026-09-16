import { describe, expect, it, vi } from 'vitest'

const publicRouteMock = vi.hoisted(() => ({
  getPublicInvitationHttp: vi.fn(),
}))

vi.mock('@/lib/volunteer-registration/http', () => publicRouteMock)

describe('public volunteer App Router routes', () => {
  it('resolves the public invitation token through an explicit Next route', async () => {
    publicRouteMock.getPublicInvitationHttp.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    const { GET } = await import('@/app/api/volunteer-invitations/[token]/public/route')

    const response = await GET(
      new Request('https://www.viralatinhas.com/api/volunteer-invitations/token-123/public'),
      { params: Promise.resolve({ token: 'token-123' }) },
    )

    expect(response.status).toBe(200)
    expect(publicRouteMock.getPublicInvitationHttp).toHaveBeenCalledWith(expect.any(Request), 'token-123')
  })
})

