import { createHash } from 'node:crypto'

export const bridgeResources = ['pages', 'posts', 'media', 'users', 'animals', 'volunteers'] as const
export type BridgeResource = typeof bridgeResources[number]

export const DEFAULT_EXPORT_LIMIT = 50
export const MAX_EXPORT_LIMIT = 100

export interface LegacyExportRequest {
  resource: BridgeResource
  runId: string
  cursor?: string
  updatedSince?: string
  limit: number
}

export interface LegacyExportItem {
  legacyId: string
  updatedAt: string
  payload: Record<string, unknown>
}

export interface LegacyExportPage {
  contractVersion: '1'
  resource: BridgeResource
  runId: string
  watermark: string
  items: LegacyExportItem[]
  nextCursor?: string
  pageChecksum: string
}

export interface ExportCursor {
  contractVersion: '1'
  resource: BridgeResource
  runId: string
  watermark: string
  updatedSince?: string
  lastUpdatedAt: string
  lastId: string
}

export const exportFields: Record<BridgeResource, readonly string[]> = {
  pages: ['id', 'title', 'slug', 'status', 'content'],
  posts: ['id', 'title', 'slug', 'excerpt', 'category', 'coverImage', 'publishedAt', 'content'],
  media: ['id', 'alt', 'filename', 'mimeType', 'filesize', 'width', 'height', 'url'],
  users: ['id', 'name', 'email', 'role', 'tenant'],
  animals: [
    'id', 'nome', 'slug', 'especie', 'sexo', 'porte', 'idade', 'peso', 'status', 'descricao',
    'historia', 'castrado', 'vacinado', 'vermifugado', 'microchipado', 'fotos', 'cor',
    'doencas', 'deficiencias', 'dataResgate',
  ],
  volunteers: [
    'id', 'status', 'nome', 'whatsapp', 'isLT', 'capacidadeLT', 'funcao', 'disponibilidade',
    'ativo', 'areaAtuacao', 'funcaoEspecifica', 'dataIngresso', 'dataDesligamento',
    'horasMediasMes', 'submittedAt', 'reviewedAt',
  ],
}

export const collectionByResource: Record<BridgeResource, string> = {
  pages: 'pages',
  posts: 'posts',
  media: 'media',
  users: 'users',
  animals: 'animals',
  volunteers: 'volunteers',
}

export class ExportRequestError extends Error {
  constructor(readonly code: string, readonly status: number) {
    super(code)
  }
}

export function parseExportRequest(params: URLSearchParams): LegacyExportRequest {
  const resource = params.get('resource')
  if (!isBridgeResource(resource)) throw new ExportRequestError('INVALID_RESOURCE', 400)

  const runId = params.get('runId')
  if (!runId || runId.length > 100) throw new ExportRequestError('INVALID_RUN_ID', 400)

  const rawLimit = params.get('limit')
  const limit = rawLimit === null ? DEFAULT_EXPORT_LIMIT : Number(rawLimit)
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_EXPORT_LIMIT) {
    throw new ExportRequestError('INVALID_LIMIT', 400)
  }

  const updatedSince = params.get('updatedSince') || undefined
  if (updatedSince && !isIsoDate(updatedSince)) throw new ExportRequestError('INVALID_UPDATED_SINCE', 400)

  return {
    resource,
    runId,
    cursor: params.get('cursor') || undefined,
    updatedSince,
    limit,
  }
}

export function encodeCursor(cursor: ExportCursor): string {
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url')
}

export function decodeCursor(value: string): ExportCursor {
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as Partial<ExportCursor>
    if (
      parsed.contractVersion !== '1' ||
      !isBridgeResource(parsed.resource) ||
      !isNonEmptyString(parsed.runId) ||
      !isIsoDate(parsed.watermark) ||
      !isIsoDate(parsed.lastUpdatedAt) ||
      !isNonEmptyString(parsed.lastId) ||
      (parsed.updatedSince !== undefined && !isIsoDate(parsed.updatedSince))
    ) throw new Error('invalid cursor')
    return parsed as ExportCursor
  } catch {
    throw new ExportRequestError('INVALID_CURSOR', 400)
  }
}

export function createPageChecksum(page: Omit<LegacyExportPage, 'pageChecksum'>): string {
  return `sha256:${createHash('sha256').update(stableStringify(page), 'utf8').digest('hex')}`
}

export function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

function isBridgeResource(value: unknown): value is BridgeResource {
  return typeof value === 'string' && bridgeResources.includes(value as BridgeResource)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`).join(',')}}`
  }
  return JSON.stringify(value)
}
