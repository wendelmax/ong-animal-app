import { describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createInvitation: vi.fn(),
  checkPublicRateLimit: vi.fn(),
  createFileDownload: vi.fn(),
  createUploadIntent: vi.fn(),
  confirmUpload: vi.fn(),
  getPublicInvitation: vi.fn(),
  reviewVolunteer: vi.fn(),
  submitRegistration: vi.fn(),
}))

vi.mock('@/lib/volunteer-registration/service', () => ({
  createFileDownload: mocks.createFileDownload,
  createInvitation: mocks.createInvitation,
  createUploadIntent: mocks.createUploadIntent,
  confirmUpload: mocks.confirmUpload,
  getPublicInvitation: mocks.getPublicInvitation,
  reviewVolunteer: mocks.reviewVolunteer,
  submitRegistration: mocks.submitRegistration,
  VolunteerRegistrationError: class VolunteerRegistrationError extends Error {},
}))

vi.mock('@/lib/volunteer-registration/rate-limit', () => ({
  checkPublicRateLimit: mocks.checkPublicRateLimit,
}))

describe('admin volunteer invitation endpoint', () => {
  it('uses a path that does not collide with the Payload collection CRUD route', async () => {
    const { volunteerRegistrationEndpoints } = await import('@/endpoints/volunteerRegistration')
    const endpoint = volunteerRegistrationEndpoints.find(
      (candidate) => candidate.method === 'post' && candidate.path === '/volunteer-invitations/generate',
    )

    expect(endpoint).toBeDefined()

    mocks.createInvitation.mockResolvedValue({ url: 'https://www.viralatinhas.com/volunteer/register/token-123' })
    const req = {
      json: vi.fn().mockResolvedValue({ expiresAt: '2026-10-16T00:00:00.000Z', maxUses: 1 }),
      payload: { id: 'payload' },
      user: { id: 'admin-1', role: 'Admin' },
      headers: new Headers({ 'user-agent': 'test-agent/1.0' }),
    }

    const response = await endpoint!.handler(req as any)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ url: 'https://www.viralatinhas.com/volunteer/register/token-123' })
    expect(mocks.createInvitation).toHaveBeenCalledWith(
      { payload: req.payload, req, user: req.user },
      { expiresAt: '2026-10-16T00:00:00.000Z', maxUses: 1 },
    )
  })
})
