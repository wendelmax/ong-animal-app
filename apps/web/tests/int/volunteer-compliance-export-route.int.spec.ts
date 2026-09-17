import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  authenticatePayloadRequest: vi.fn(),
  decryptVolunteerCpf: vi.fn(),
  VolunteerRegistrationError: class VolunteerRegistrationError extends Error {
    constructor(public readonly code: string, public readonly status = 400) { super(code) }
  },
}))

vi.mock('../../src/lib/volunteer-registration/auth', () => ({ authenticatePayloadRequest: mocks.authenticatePayloadRequest }))
vi.mock('../../src/lib/volunteer-registration/service', () => ({ decryptVolunteerCpf: mocks.decryptVolunteerCpf, VolunteerRegistrationError: mocks.VolunteerRegistrationError }))

describe('volunteer compliance export route', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns masked CSV and records an audit event', async () => {
    const payload = {
      find: vi.fn().mockResolvedValue({ docs: [{ id: 7, nome: 'Ana', cpfMasked: '***.456.789-**', areaAtuacao: 'Resgate', funcaoEspecifica: 'Apoio', dataIngresso: '2026-01-10T00:00:00.000Z', horasMediasMes: 8, status: 'ACTIVE' }] }),
      create: vi.fn().mockResolvedValue({ id: 11 }),
    }
    const req = { payload }
    mocks.authenticatePayloadRequest.mockResolvedValue({ payload, req, user: { id: 1, role: 'VOLUNTEER_MANAGER' } })
    const { GET } = await import('@/app/api/v1/compliance/cge/export-volunteers/route')
    const response = await GET(new Request('https://www.viralatinhas.com/api/v1/compliance/cge/export-volunteers?year=2026&includeCpf=false'))
    const csv = await response.text()
    expect(response.status).toBe(200)
    expect(csv).toContain('***.456.789-**')
    expect(csv).not.toContain('123.456.789-09')
    expect(payload.create).toHaveBeenCalledWith(expect.objectContaining({ collection: 'audit-events', data: expect.objectContaining({ eventType: 'LGPD_SENSITIVE_DATA_EXPORT', metadata: { year: 2026, recordsCount: 1, includeCpf: false } }) }))
  })

  it('allows full CPF only for compliance roles', async () => {
    const payload = { find: vi.fn().mockResolvedValue({ docs: [{ nome: 'Ana', cpfEncrypted: 'encrypted', cpfMasked: '***.456.789-**', areaAtuacao: 'Resgate', funcaoEspecifica: 'Apoio', dataIngresso: '2026-01-10T00:00:00.000Z', horasMediasMes: 8, status: 'ACTIVE' }] }), create: vi.fn().mockResolvedValue({ id: 12 }) }
    mocks.authenticatePayloadRequest.mockResolvedValue({ payload, req: { payload }, user: { id: 2, role: 'COMPLIANCE_OFFICER' } })
    mocks.decryptVolunteerCpf.mockReturnValue('12345678909')
    const { GET } = await import('@/app/api/v1/compliance/cge/export-volunteers/route')
    const response = await GET(new Request('https://www.viralatinhas.com/api/v1/compliance/cge/export-volunteers?year=2026&includeCpf=true'))
    expect(response.status).toBe(200)
    expect(await response.text()).toContain('123.456.789-09')
    expect(mocks.decryptVolunteerCpf).toHaveBeenCalledWith('encrypted')
  })

  it('rejects unauthenticated, unauthorized and invalid-year requests', async () => {
    const payload = { find: vi.fn(), create: vi.fn() }
    mocks.authenticatePayloadRequest.mockResolvedValue({ payload, req: { payload }, user: null })
    const { GET } = await import('@/app/api/v1/compliance/cge/export-volunteers/route')
    expect((await GET(new Request('https://www.viralatinhas.com/api/v1/compliance/cge/export-volunteers?year=2026'))).status).toBe(401)

    mocks.authenticatePayloadRequest.mockResolvedValue({ payload, req: { payload }, user: { id: 3, role: 'VOLUNTEER_MANAGER' } })
    expect((await GET(new Request('https://www.viralatinhas.com/api/v1/compliance/cge/export-volunteers?year=2026&includeCpf=true'))).status).toBe(403)
    expect((await GET(new Request('https://www.viralatinhas.com/api/v1/compliance/cge/export-volunteers?year=1999'))).status).toBe(400)
  })
})
