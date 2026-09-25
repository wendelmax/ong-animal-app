import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ExportRequest } from '@/lib/nodepress-migration/export-service'

const loadHandler = async () => {
  const module = await import('@/lib/nodepress-migration/export-service')
  return module.handleNodepressExport
}

const makeRequest = (payload: ExportRequest['payload'], headers: Record<string, string> = {}, search = ''): ExportRequest => ({
  headers: new Headers(headers),
  payload,
  url: `https://legacy.example.test/api/internal/nodepress-export${search}`,
})

describe('NodePress legacy export boundary', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('rejects requests without the bridge token', async () => {
    vi.stubEnv('NODEPRESS_BRIDGE_TOKEN', 'bridge-secret')
    vi.stubEnv('NODEPRESS_BRIDGE_AUDIENCE', 'nodepress')

    const handleNodepressExport = await loadHandler()
    const response = await handleNodepressExport(makeRequest({ find: vi.fn() }))

    expect(response.status).toBe(401)
  })

  it('rejects an invalid audience without querying Payload', async () => {
    vi.stubEnv('NODEPRESS_BRIDGE_TOKEN', 'bridge-secret')
    vi.stubEnv('NODEPRESS_BRIDGE_AUDIENCE', 'nodepress')
    const payload = { find: vi.fn() }

    const handleNodepressExport = await loadHandler()
    const response = await handleNodepressExport(makeRequest(payload, {
      authorization: 'Bearer bridge-secret',
      'x-nodepress-audience': 'another-service',
    }))

    expect(response.status).toBe(403)
    expect(payload.find).not.toHaveBeenCalled()
  })

  it('returns a bounded, sanitized page with a stable watermark and cursor', async () => {
    vi.stubEnv('NODEPRESS_BRIDGE_TOKEN', 'bridge-secret')
    vi.stubEnv('NODEPRESS_BRIDGE_AUDIENCE', 'nodepress')
    const payload = {
      find: vi.fn().mockResolvedValue({
        docs: [{
          id: 'animal-1',
          updatedAt: '2026-09-23T23:59:00.000Z',
          nome: 'Luna',
          status: 'Disponível',
          password: 'must-not-leak',
          cpfEncrypted: 'must-not-leak',
          resetPasswordToken: 'must-not-leak',
        }],
        hasNextPage: true,
      }),
      create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
    }

    const handleNodepressExport = await loadHandler()
    const response = await handleNodepressExport(makeRequest(payload, {
      authorization: 'Bearer bridge-secret',
      'x-nodepress-audience': 'nodepress',
    }, '?resource=animals&runId=run-1&limit=1000'))
    const body = await response.json()

    expect(response.status).toBe(400)

    const validResponse = await handleNodepressExport(makeRequest(payload, {
      authorization: 'Bearer bridge-secret',
      'x-nodepress-audience': 'nodepress',
    }, '?resource=animals&runId=run-1&limit=1'))
    const validBody = await validResponse.json()

    expect(validResponse.status).toBe(200)
    expect(validBody).toMatchObject({
      contractVersion: '1',
      resource: 'animals',
      runId: 'run-1',
      watermark: expect.any(String),
      nextCursor: expect.any(String),
    })
    expect(validBody.items[0]).toEqual({
      legacyId: 'animal-1',
      updatedAt: '2026-09-23T23:59:00.000Z',
      payload: { id: 'animal-1', nome: 'Luna', status: 'Disponível' },
    })
    expect(JSON.stringify(validBody)).not.toContain('must-not-leak')
    expect(payload.create).toHaveBeenCalledWith(expect.objectContaining({ collection: 'audit-events' }))
    expect(body.error).toBe('INVALID_LIMIT')
  })

  it('keeps the watermark across pages and applies the updated-since boundary', async () => {
    vi.stubEnv('NODEPRESS_BRIDGE_TOKEN', 'bridge-secret')
    vi.stubEnv('NODEPRESS_BRIDGE_AUDIENCE', 'nodepress')
    const payload = {
      find: vi.fn()
        .mockResolvedValueOnce({ docs: [{ id: 'page-1', updatedAt: '2026-09-23T12:00:00.000Z', title: 'One' }], hasNextPage: true })
        .mockResolvedValueOnce({ docs: [], hasNextPage: false }),
      create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
    }

    const handleNodepressExport = await loadHandler()
    const first = await handleNodepressExport(makeRequest(payload, {
      authorization: 'Bearer bridge-secret',
      'x-nodepress-audience': 'nodepress',
    }, '?resource=pages&runId=run-2&updatedSince=2026-09-01T00:00:00.000Z&limit=1'))
    const firstBody = await first.json()
    const second = await handleNodepressExport(makeRequest(payload, {
      authorization: 'Bearer bridge-secret',
      'x-nodepress-audience': 'nodepress',
    }, `?resource=pages&runId=run-2&cursor=${encodeURIComponent(firstBody.nextCursor)}`))
    const secondBody = await second.json()

    expect(first.status).toBe(200)
    expect(second.status).toBe(200)
    expect(secondBody.watermark).toBe(firstBody.watermark)
    expect(payload.find).toHaveBeenCalledTimes(2)
    expect(payload.find.mock.calls[0][0].where.and).toContainEqual({
      updatedAt: { less_than_equal: firstBody.watermark },
    })
  })
})
