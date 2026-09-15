import { createCipheriv, createHash, randomBytes, randomUUID } from 'node:crypto'
import type { R2StoragePort } from '../storage/r2'
import { r2Storage } from '../storage/r2'
import { createCpfBlindIndex, maskCpf, normalizeCpf } from './cpf'
import { canDownloadVolunteerFile, canManageVolunteerInvitations, canReviewVolunteer } from './access'
import { createInvitationSecret } from './tokens'
import type { FilePurpose, InvitationStatus } from './types'
import { evaluateInvitation, validateVolunteerFile } from './validation'

const ACCEPTANCE_STATEMENT = 'Li e concordo com os termos de adesão e tratamento de dados'
const publicUrl = (token: string) => `${process.env.NEXT_PUBLIC_SERVER_URL || ''}/voluntarios/cadastro/${token}`
const LEGACY_FUNCTIONS = ['Resgate', 'Lar Temporário', 'Transporte', 'Eventos', 'Administrativo', 'Marketing'] as const

const legacyFunctionFromInput = (input: any) => {
  if (LEGACY_FUNCTIONS.includes(input.funcao)) return input.funcao
  const area = String(input.activityArea || '').toLocaleLowerCase('pt-BR')
  if (area.includes('admin')) return 'Administrativo'
  if (area.includes('marketing')) return 'Marketing'
  if (area.includes('transport')) return 'Transporte'
  if (area.includes('evento')) return 'Eventos'
  if (area.includes('lar tempor')) return 'Lar Temporário'
  return 'Resgate'
}

export class VolunteerRegistrationError extends Error {
  constructor(public readonly code: string, public readonly status = 400) { super(code) }
}

type PayloadLike = { find: Function; create: Function; update: Function }
type RequestContext = { payload: PayloadLike; req?: any; user?: any; r2?: R2StoragePort }
type PublicContext = RequestContext & { ipAddress: string; userAgent: string }

const adapter = (ctx: RequestContext) => ctx.r2 || r2Storage
const hashToken = (token: string) => createHash('sha256').update(token, 'utf8').digest('hex')
const nowIso = () => new Date().toISOString()

const findInvitation = async (ctx: RequestContext, rawToken: string) => {
  const result = await ctx.payload.find({ collection: 'volunteer-invitations', where: { tokenHash: { equals: hashToken(rawToken) } }, limit: 1, overrideAccess: true })
  const invitation = result.docs?.[0]
  if (!invitation || !evaluateInvitation({ status: invitation.status as InvitationStatus, expiresAt: invitation.expiresAt, usedCount: invitation.usedCount, maxUses: invitation.maxUses, now: new Date() }).valid) {
    throw new VolunteerRegistrationError('INVITATION_INVALID', 404)
  }
  return invitation
}

const audit = async (ctx: PublicContext | RequestContext, data: Record<string, unknown>) => {
  await ctx.payload.create({ collection: 'audit-events', data: { occurredAt: nowIso(), actorType: ctx.user ? 'ADMIN' : 'PUBLIC_INVITATION', actorId: ctx.user?.id, actorRole: ctx.user?.role, ipAddress: 'ipAddress' in ctx ? ctx.ipAddress : undefined, userAgent: 'userAgent' in ctx ? ctx.userAgent : undefined, metadata: {}, ...data }, overrideAccess: true })
}

const requireAdmin = (ctx: RequestContext, predicate: (user: any) => boolean) => {
  if (!predicate(ctx.user)) throw new VolunteerRegistrationError('FORBIDDEN', 403)
}

export async function createInvitation(ctx: RequestContext, input: { expiresAt: string; maxUses?: number }) {
  requireAdmin(ctx, canManageVolunteerInvitations)
  const expiresAt = new Date(input.expiresAt)
  const maxUses = input.maxUses ?? 1
  if (!Number.isFinite(expiresAt.getTime()) || expiresAt <= new Date() || maxUses < 1 || maxUses > 10) throw new VolunteerRegistrationError('INVALID_INVITATION')
  const secret = createInvitationSecret()
  const invitation = await ctx.payload.create({ collection: 'volunteer-invitations', data: { tokenHash: secret.tokenHash, createdBy: ctx.user.id, expiresAt: expiresAt.toISOString(), maxUses, usedCount: 0, status: 'ACTIVE' }, overrideAccess: true })
  await audit(ctx, { eventType: 'VOLUNTEER_INVITATION_CREATED', targetType: 'volunteer-invitations', targetId: invitation.id })
  return { url: publicUrl(secret.rawToken), expiresAt: expiresAt.toISOString() }
}

export async function getPublicInvitation(ctx: PublicContext, rawToken: string) {
  const invitation = await findInvitation(ctx, rawToken)
  const terms = await ctx.payload.find({ collection: 'membership-term-versions', where: { status: { equals: 'PUBLISHED' }, effectiveFrom: { less_than_equal: nowIso() } }, sort: '-effectiveFrom', limit: 1, overrideAccess: true })
  const term = terms.docs?.[0]
  if (!term) throw new VolunteerRegistrationError('TERM_UNAVAILABLE', 503)
  await audit(ctx, { eventType: 'VOLUNTEER_INVITATION_OPENED', targetType: 'volunteer-invitations', targetId: invitation.id })
  return { invitationId: invitation.id, expiresAt: invitation.expiresAt, submissionId: randomUUID(), term: { id: term.id, version: term.version, content: term.content, contentHash: term.contentHash } }
}

const extensionFor = (mimeType: string) => mimeType === 'application/pdf' ? 'pdf' : mimeType === 'image/png' ? 'png' : 'jpg'

export async function createUploadIntent(ctx: PublicContext, rawToken: string, input: { submissionId: string; purpose: FilePurpose; mimeType: string; sizeBytes: number; sha256: string }) {
  const invitation = await findInvitation(ctx, rawToken)
  const validation = validateVolunteerFile(input)
  if (!validation.valid) throw new VolunteerRegistrationError(validation.error)
  if (!/^[0-9a-f-]{20,80}$/.test(input.submissionId)) throw new VolunteerRegistrationError('INVALID_SUBMISSION')
  const objectKey = `volunteer-intake/${invitation.id}/${input.submissionId}/${input.purpose.toLowerCase()}.${extensionFor(input.mimeType)}`
  const existing = await ctx.payload.find({ collection: 'volunteer-files', where: { invitation: { equals: invitation.id }, submissionId: { equals: input.submissionId }, purpose: { equals: input.purpose }, uploadStatus: { not_equals: 'DELETED' } }, limit: 1, overrideAccess: true })
  const file = existing.docs?.[0] || await ctx.payload.create({ collection: 'volunteer-files', data: { invitation: invitation.id, submissionId: input.submissionId, purpose: input.purpose, storageProvider: 'R2', objectKey, mimeType: input.mimeType, sizeBytes: input.sizeBytes, sha256: input.sha256, uploadStatus: 'PENDING' }, overrideAccess: true })
  const signed = await adapter(ctx).createUploadUrl({ objectKey, contentType: input.mimeType, maxSizeBytes: input.sizeBytes })
  await audit(ctx, { eventType: 'VOLUNTEER_UPLOAD_INTENT', targetType: 'volunteer-files', targetId: file.id })
  return { fileId: file.id, submissionId: input.submissionId, objectKey, ...signed }
}

export async function confirmUpload(ctx: PublicContext, rawToken: string, input: { fileId: string }) {
  const invitation = await findInvitation(ctx, rawToken)
  const result = await ctx.payload.find({ collection: 'volunteer-files', where: { id: { equals: input.fileId }, invitation: { equals: invitation.id } }, limit: 1, overrideAccess: true })
  const file = result.docs?.[0]
  if (!file) throw new VolunteerRegistrationError('FILE_NOT_FOUND', 404)
  const head = await adapter(ctx).headObject(file.objectKey)
  if (!head.exists || head.sizeBytes !== file.sizeBytes || head.contentType !== file.mimeType) throw new VolunteerRegistrationError('FILE_MISMATCH')
  const updated = await ctx.payload.update({ collection: 'volunteer-files', id: file.id, data: { uploadStatus: 'UPLOADED', uploadedAt: nowIso() }, overrideAccess: true })
  await audit(ctx, { eventType: 'VOLUNTEER_UPLOAD_CONFIRMED', targetType: 'volunteer-files', targetId: file.id })
  return { id: updated.id, purpose: updated.purpose, uploadStatus: updated.uploadStatus }
}

const encryptCpf = (cpf: string) => {
  const rawKey = process.env.VOLUNTEER_CPF_ENCRYPTION_KEY
  if (!rawKey) throw new VolunteerRegistrationError('CPF_ENCRYPTION_NOT_CONFIGURED', 503)
  const key = Buffer.from(rawKey, 'base64')
  if (key.length !== 32) throw new VolunteerRegistrationError('CPF_ENCRYPTION_NOT_CONFIGURED', 503)
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(cpf, 'utf8'), cipher.final()])
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64')
}

export async function submitRegistration(ctx: PublicContext, rawToken: string, input: any) {
  const invitation = await findInvitation(ctx, rawToken)
  if (input.statement !== ACCEPTANCE_STATEMENT || !input.termVersionId || !input.submissionId) throw new VolunteerRegistrationError('ACCEPTANCE_REQUIRED')
  const files = await ctx.payload.find({ collection: 'volunteer-files', where: { invitation: { equals: invitation.id }, submissionId: { equals: input.submissionId }, uploadStatus: { equals: 'UPLOADED' } }, limit: 10, overrideAccess: true })
  const byPurpose = new Map(files.docs.map((file: any) => [file.purpose, file]))
  if (!byPurpose.has('PERSONAL_PHOTO') || !byPurpose.has('IDENTITY_DOCUMENT')) throw new VolunteerRegistrationError('FILES_REQUIRED')
  const cpf = normalizeCpf(input.cpf)
  const pepper = process.env.VOLUNTEER_CPF_HMAC_PEPPER
  if (!pepper) throw new VolunteerRegistrationError('CPF_ENCRYPTION_NOT_CONFIGURED', 503)
  const termResult = await ctx.payload.find({ collection: 'membership-term-versions', where: { id: { equals: input.termVersionId }, status: { equals: 'PUBLISHED' } }, limit: 1, overrideAccess: true })
  const term = termResult.docs?.[0]
  if (!term || term.contentHash !== input.termContentHash) throw new VolunteerRegistrationError('TERM_CHANGED')
  const volunteer = await ctx.payload.create({ collection: 'volunteers', data: { nome: input.fullName, whatsapp: input.phone, email: input.email, dataNascimento: input.birthDate, rg: input.rg, orgaoEmissor: input.rgIssuer, cpfEncrypted: encryptCpf(cpf), cpfBlindIndex: createCpfBlindIndex(cpf, pepper), cpfMasked: maskCpf(cpf), enderecoRua: input.addressStreet, enderecoBairro: input.addressNeighborhood, cidade: input.addressCity || 'Sumaré', cep: input.addressZipcode, funcao: legacyFunctionFromInput(input), areaAtuacao: input.activityArea, funcaoEspecifica: input.specificRole, dataIngresso: input.admittedAt || nowIso(), horasMediasMes: input.avgHoursPerMonth, sourceInvitation: invitation.id, status: 'PENDING_REVIEW', ativo: false, submittedAt: nowIso() }, overrideAccess: true })
  for (const file of files.docs) await ctx.payload.update({ collection: 'volunteer-files', id: file.id, data: { volunteer: volunteer.id }, overrideAccess: true })
  await ctx.payload.create({ collection: 'volunteer-term-acceptances', data: { volunteer: volunteer.id, termVersion: term.id, acceptedAt: nowIso(), ipAddress: ctx.ipAddress, userAgent: ctx.userAgent, contentHashAtAcceptance: term.contentHash, statement: ACCEPTANCE_STATEMENT }, overrideAccess: true })
  await ctx.payload.update({ collection: 'volunteer-invitations', id: invitation.id, data: { usedCount: invitation.usedCount + 1, status: invitation.usedCount + 1 >= invitation.maxUses ? 'EXHAUSTED' : 'ACTIVE', lastUsedAt: nowIso() }, overrideAccess: true })
  await audit(ctx, { eventType: 'VOLUNTEER_SUBMITTED', targetType: 'volunteers', targetId: volunteer.id, legalGround: 'LEGAL_OBLIGATION_ART_7_II_LGPD' })
  return { volunteerId: volunteer.id, status: 'PENDING_REVIEW' as const }
}

export async function reviewVolunteer(ctx: RequestContext, volunteerId: string, input: { decision: 'APPROVE' | 'REJECT'; rejectionReason?: string }) {
  requireAdmin(ctx, canReviewVolunteer)
  if (input.decision === 'REJECT' && !input.rejectionReason?.trim()) throw new VolunteerRegistrationError('REJECTION_REASON_REQUIRED')
  const updated = await ctx.payload.update({ collection: 'volunteers', id: volunteerId, data: { status: input.decision === 'APPROVE' ? 'ACTIVE' : 'REJECTED', ativo: input.decision === 'APPROVE', reviewedAt: nowIso(), reviewedBy: ctx.user.id, rejectionReason: input.rejectionReason }, overrideAccess: true })
  await audit(ctx, { eventType: input.decision === 'APPROVE' ? 'VOLUNTEER_APPROVED' : 'VOLUNTEER_REJECTED', targetType: 'volunteers', targetId: volunteerId })
  return { id: updated.id, status: updated.status }
}

export async function createFileDownload(ctx: RequestContext, volunteerId: string, fileId: string) {
  requireAdmin(ctx, canDownloadVolunteerFile)
  const result = await ctx.payload.find({ collection: 'volunteer-files', where: { id: { equals: fileId }, volunteer: { equals: volunteerId }, uploadStatus: { equals: 'UPLOADED' } }, limit: 1, overrideAccess: true })
  const file = result.docs?.[0]
  if (!file) throw new VolunteerRegistrationError('FILE_NOT_FOUND', 404)
  const signed = await adapter(ctx).createDownloadUrl(file.objectKey)
  await audit(ctx, { eventType: 'LGPD_SENSITIVE_FILE_ACCESS', targetType: 'volunteer-files', targetId: file.id, legalGround: 'LEGITIMATE_ADMINISTRATIVE_ACCESS' })
  return signed
}

export { ACCEPTANCE_STATEMENT }
