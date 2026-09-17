import { describe, expect, it, vi } from 'vitest'

const publicRouteMock = vi.hoisted(() => ({
  createInvitationHttp: vi.fn(),
  getPublicInvitationHttp: vi.fn(),
}))

vi.mock('@/lib/volunteer-registration/http', () => publicRouteMock)

describe('public volunteer App Router routes', () => {
  it('delegates invitation generation to the authenticated HTTP dispatcher', async () => {
    publicRouteMock.createInvitationHttp.mockResolvedValue(
      new Response(JSON.stringify({ url: 'https://www.viralatinhas.com/voluntarios/cadastro/token-123', expiresAt: '2026-10-16T00:00:00.000Z' }), { status: 200 }),
    )
    const { POST } = await import('@/app/api/volunteer-invitations/generate/route')
    const request = new Request('https://www.viralatinhas.com/api/volunteer-invitations/generate', {
      method: 'POST',
      body: JSON.stringify({ expiresAt: '2026-10-16T00:00:00.000Z', maxUses: 1 }),
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(publicRouteMock.createInvitationHttp).toHaveBeenCalledWith(request)
  })

  it('resolves the public invitation token through an explicit Next route', async () => {
    publicRouteMock.getPublicInvitationHttp.mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    )
    const { GET } = await import('@/app/api/volunteer-invitations/[token]/public/route')

    const response = await GET(
      new Request('https://www.viralatinhas.com/api/volunteer-invitations/token-123/public'),
      { params: Promise.resolve({ token: 'token-123' }) },
    )

    expect(response.status).toBe(200)
    expect(publicRouteMock.getPublicInvitationHttp).toHaveBeenCalledWith(
      expect.any(Request),
      'token-123',
    )
  })
})
