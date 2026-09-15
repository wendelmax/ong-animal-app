import type {
  FilePurpose,
  InvitationStatus,
  ValidationResult,
} from './types'

const MAX_FILE_SIZE_BYTES = 10_000_000

const ALLOWED_MIME_TYPES: Record<FilePurpose, readonly string[]> = {
  PERSONAL_PHOTO: ['image/jpeg', 'image/png'],
  IDENTITY_DOCUMENT: ['image/jpeg', 'image/png', 'application/pdf'],
}

export function isTermCurrentlyEffective(term: { status?: string; effectiveFrom: string; effectiveUntil?: string | null }, now = new Date()): boolean {
  const startsAt = new Date(term.effectiveFrom).getTime()
  const endsAt = term.effectiveUntil ? new Date(term.effectiveUntil).getTime() : Number.POSITIVE_INFINITY
  return term.status === 'PUBLISHED' && startsAt <= now.getTime() && now.getTime() < endsAt
}

export function evaluateInvitation(input: {
  status: InvitationStatus
  expiresAt: string
  usedCount: number
  maxUses: number
  now: Date
}): { valid: boolean; publicStatus: 'ACTIVE' | 'INVALID' } {
  const valid =
    input.status === 'ACTIVE' &&
    new Date(input.expiresAt).getTime() > input.now.getTime() &&
    input.usedCount < input.maxUses

  return valid
    ? { valid: true, publicStatus: 'ACTIVE' }
    : { valid: false, publicStatus: 'INVALID' }
}

export function validateVolunteerFile(input: {
  purpose: FilePurpose
  mimeType: string
  sizeBytes: number
  sha256: string
}): ValidationResult {
  const allowedMimeTypes = ALLOWED_MIME_TYPES[input.purpose]

  if (!allowedMimeTypes) {
    return { valid: false, error: 'WRONG_PURPOSE' }
  }

  if (!allowedMimeTypes.includes(input.mimeType)) {
    return { valid: false, error: 'INVALID_MIME' }
  }

  if (input.sizeBytes > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'FILE_TOO_LARGE' }
  }

  if (!/^[a-f0-9]{64}$/.test(input.sha256)) {
    return { valid: false, error: 'INVALID_CHECKSUM' }
  }

  return { valid: true }
}
