import type { LegacyExportPage } from './export-contract'
import {
  collectionByResource,
  createPageChecksum,
  decodeCursor,
  encodeCursor,
  exportFields,
  ExportRequestError,
  parseExportRequest,
  type BridgeResource,
  type ExportCursor,
} from './export-contract'

type PayloadDocument = Record<string, unknown> & { id: string | number; updatedAt?: string; createdAt?: string }

interface PayloadFindResult {
  docs: PayloadDocument[]
  hasNextPage?: boolean
}

export interface PayloadExportClient {
  find(args: Record<string, unknown>): Promise<PayloadFindResult>
  create?(args: Record<string, unknown>): Promise<unknown>
}

export interface ExportRequest {
  url: string
  headers: Headers
  payload: PayloadExportClient
}

export async function handleNodepressExport(req: ExportRequest): Promise<Response> {
  try {
    authorize(req.headers)
    const request = parseExportRequest(new URL(req.url).searchParams)
    const cursor = request.cursor ? decodeCursor(request.cursor) : undefined
    validateCursor(request.resource, request.runId, request.updatedSince, cursor)
    const updatedSince = request.updatedSince ?? cursor?.updatedSince

    const watermark = cursor?.watermark || new Date().toISOString()
    const result = await req.payload.find({
      collection: collectionByResource[request.resource],
      where: buildWhere(updatedSince, watermark, cursor),
      sort: 'updatedAt,id',
      limit: request.limit + 1,
      overrideAccess: true,
      depth: 0,
    })

    const docs = result.docs.slice(0, request.limit)
    const items = docs.map((doc) => toExportItem(request.resource, doc, watermark))
    const hasNextPage = result.hasNextPage === true || result.docs.length > request.limit
    const lastItem = items.at(-1)
    const nextCursor = hasNextPage && lastItem
      ? encodeCursor({
        contractVersion: '1',
        resource: request.resource,
        runId: request.runId,
        watermark,
        updatedSince,
        lastUpdatedAt: lastItem.updatedAt,
        lastId: lastItem.legacyId,
      })
      : undefined

    const pageWithoutChecksum = {
      contractVersion: '1' as const,
      resource: request.resource,
      runId: request.runId,
      watermark,
      items,
      ...(nextCursor ? { nextCursor } : {}),
    }
    const page: LegacyExportPage = {
      ...pageWithoutChecksum,
      pageChecksum: createPageChecksum(pageWithoutChecksum),
    }

    await recordExportAudit(req.payload, request.resource, request.runId, watermark, items.length)
    return Response.json(page)
  } catch (error) {
    if (error instanceof ExportRequestError) return Response.json({ error: error.code }, { status: error.status })
    return Response.json({ error: 'EXPORT_FAILED' }, { status: 500 })
  }
}

function authorize(headers: Headers): void {
  const expectedToken = process.env.NODEPRESS_BRIDGE_TOKEN
  const expectedAudience = process.env.NODEPRESS_BRIDGE_AUDIENCE || 'nodepress'
  const authorization = headers.get('authorization')
  const audience = headers.get('x-nodepress-audience')

  if (!expectedToken || !authorization) throw new ExportRequestError('UNAUTHORIZED', 401)
  if (authorization !== `Bearer ${expectedToken}` || audience !== expectedAudience) {
    throw new ExportRequestError('FORBIDDEN', 403)
  }
}

function validateCursor(resource: BridgeResource, runId: string, updatedSince: string | undefined, cursor: ExportCursor | undefined): void {
  if (!cursor) return
  if (cursor.resource !== resource || cursor.runId !== runId || (updatedSince !== undefined && cursor.updatedSince !== updatedSince)) {
    throw new ExportRequestError('INVALID_CURSOR', 400)
  }
}

function buildWhere(updatedSince: string | undefined, watermark: string, cursor: ExportCursor | undefined): Record<string, unknown> {
  const predicates: Record<string, unknown>[] = [
    { updatedAt: { less_than_equal: watermark } },
  ]
  if (updatedSince) predicates.push({ updatedAt: { greater_than: updatedSince } })
  if (cursor) {
    predicates.push({
      or: [
        { updatedAt: { greater_than: cursor.lastUpdatedAt } },
        { and: [{ updatedAt: { equals: cursor.lastUpdatedAt } }, { id: { greater_than: cursor.lastId } }] },
      ],
    })
  }
  return { and: predicates }
}

function toExportItem(resource: BridgeResource, doc: PayloadDocument, watermark: string) {
  const updatedAt = typeof doc.updatedAt === 'string' ? new Date(doc.updatedAt).toISOString() : watermark
  const payload: Record<string, unknown> = {}
  for (const field of exportFields[resource]) {
    if (field in doc) payload[field] = sanitizeValue(doc[field])
  }
  payload.id = String(doc.id)
  return { legacyId: String(doc.id), updatedAt, payload }
}

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeValue)
  if (value instanceof Date) return value.toISOString()
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (isSensitiveKey(key)) continue
      result[key] = sanitizeValue(nested)
    }
    return result
  }
  return value
}

function isSensitiveKey(key: string): boolean {
  return /password|token|secret|hash|session|encrypted|blindindex|api[-_]?key/i.test(key)
}

async function recordExportAudit(payload: PayloadExportClient, resource: BridgeResource, runId: string, watermark: string, count: number): Promise<void> {
  if (!payload.create) return
  await payload.create({
    collection: 'audit-events',
    data: {
      eventType: 'NODEPRESS_EXPORT',
      occurredAt: new Date().toISOString(),
      actorType: 'SYSTEM',
      targetType: resource,
      targetId: runId,
      metadata: { runId, resource, count, watermark },
    },
    overrideAccess: true,
  })
}
