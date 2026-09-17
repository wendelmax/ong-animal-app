import { describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  authenticatePayloadRequest: vi.fn(),
  createInvitation: vi.fn(),
  checkPublicRateLimit: vi.fn(),
  createFileDownload: vi.fn(),
  createUploadIntent: vi.fn(),
  confirmUpload: vi.fn(),
  getPublicInvitation: vi.fn(),
  reviewVolunteer: vi.fn(),
  submitRegistration: vi.fn(),
  VolunteerRegistrationError: class VolunteerRegistrationError extends Error {
    constructor(
      public readonly code: string,
      public readonly status = 400,
    ) {
      super(code)
    }
  },
}))

vi.mock('../../src/lib/volunteer-registration/service', () => ({
  createFileDownload: mocks.createFileDownload,
  createInvitation: mocks.createInvitation,
  createUploadIntent: mocks.createUploadIntent,
  confirmUpload: mocks.confirmUpload,
  getPublicInvitation: mocks.getPublicInvitation,
  reviewVolunteer: mocks.reviewVolunteer,
  submitRegistration: mocks.submitRegistration,
  VolunteerRegistrationError: mocks.VolunteerRegistrationError,
}))

vi.mock('../../src/lib/volunteer-registration/auth', () => ({
  authenticatePayloadRequest: mocks.authenticatePayloadRequest,
}))

vi.mock('../../src/payload.config', () => ({ default: {} }))

vi.mock('payload', () => ({ getPayload: vi.fn() }))

vi.mock('../../src/lib/volunteer-registration/rate-limit', () => ({
  checkPublicRateLimit: mocks.checkPublicRateLimit,
}))

vi.mock('@upstash/ratelimit', () => ({ Ratelimit: class Ratelimit {} }))

vi.mock('@upstash/redis', () => ({ Redis: class Redis {} }))

describe('volunteer invitation endpoints', () => {
  it('removes the duplicate Payload endpoint that collides with collection CRUD', async () => {
    const { volunteerRegistrationEndpoints } = await import('@/endpoints/volunteerRegistration')
    const endpoint = volunteerRegistrationEndpoints.find(
      (candidate) => candidate.method === 'post' && candidate.path === '/volunteer-invitations/generate',
    )

    expect(endpoint).toBeUndefined()
  })

  it('authenticates and delegates invitation creation through the HTTP dispatcher', async () => {
    const { createInvitationHttp } = await import('@/lib/volunteer-registration/http')
    const payload = { id: 'payload' }
    const req = { id: 'payload-request' }
    const user = { id: 'admin-1', role: 'Admin' }
    mocks.authenticatePayloadRequest.mockResolvedValue({ payload, req, user })
    mocks.createInvitation.mockResolvedValue({
      url: 'https://www.viralatinhas.com/volunteer/register/token-123',
      expiresAt: '2026-10-16T00:00:00.000Z',
    })
    const request = new Request('https://www.viralatinhas.com/api/volunteer-invitations/generate', {
      method: 'POST',
      body: JSON.stringify({ expiresAt: '2026-10-16T00:00:00.000Z', maxUses: 1 }),
    })

    const response = await createInvitationHttp(request)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      url: 'https://www.viralatinhas.com/volunteer/register/token-123',
      expiresAt: '2026-10-16T00:00:00.000Z',
    })
    expect(mocks.authenticatePayloadRequest).toHaveBeenCalledWith(request)
    expect(mocks.createInvitation).toHaveBeenCalledWith(
      { payload, req, user },
      { expiresAt: '2026-10-16T00:00:00.000Z', maxUses: 1 },
    )
  })

  it('normalizes authentication errors from the HTTP dispatcher', async () => {
    const { createInvitationHttp } = await import('@/lib/volunteer-registration/http')
    mocks.authenticatePayloadRequest.mockRejectedValue(
      new mocks.VolunteerRegistrationError('FORBIDDEN', 403),
    )

    const response = await createInvitationHttp(
      new Request('https://www.viralatinhas.com/api/volunteer-invitations/generate', { method: 'POST' }),
    )

    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({ error: 'FORBIDDEN' })
  })
})
