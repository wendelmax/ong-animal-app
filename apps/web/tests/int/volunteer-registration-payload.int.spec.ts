import { randomUUID } from 'node:crypto'

import { beforeAll, afterAll, describe, expect, it } from 'vitest'
import { getPayload } from 'payload'

import config from '@/payload.config'
import {
  ACCEPTANCE_STATEMENT,
  confirmUpload,
  createInvitation,
  createUploadIntent,
  getPublicInvitation,
  submitRegistration,
} from '@/lib/volunteer-registration/service'
import type { R2StoragePort } from '@/lib/storage/r2'

const describeWithDatabase = describe.skipIf(!process.env.DATABASE_URL)

describeWithDatabase('volunteer registration with Payload and PostgreSQL', () => {
  let payload: any
  let adminUserId: string
  let termId: string
  let invitationId: string
  let volunteerId: string

  const objectMetadata = new Map<string, { sizeBytes: number; contentType: string; sha256: string }>()
  const r2: R2StoragePort = {
    async createUploadUrl({ objectKey, contentType, maxSizeBytes, sha256 }) {
      objectMetadata.set(objectKey, { sizeBytes: maxSizeBytes, contentType, sha256 })
      return { url: `https://storage.test/${encodeURIComponent(objectKey)}`, expiresAt: new Date(Date.now() + 900_000).toISOString(), headers: { 'Content-Type': contentType, 'x-amz-meta-sha256': sha256 } }
    },
    async headObject(objectKey) {
      const metadata = objectMetadata.get(objectKey)
      return metadata ? { exists: true, ...metadata } : { exists: false }
    },
    async createDownloadUrl(objectKey) {
      return { url: `https://storage.test/download/${encodeURIComponent(objectKey)}`, expiresAt: new Date(Date.now() + 300_000).toISOString() }
    },
    async deleteObject() {},
  }

  beforeAll(async () => {
    payload = await getPayload({ config })

    const admin = await payload.create({
      collection: 'users',
      data: { email: `integration-${randomUUID()}@example.test`, password: 'integration-password', name: 'Integration Admin', role: 'Admin' },
      overrideAccess: true,
    })
    adminUserId = admin.id

    const term = await payload.create({
      collection: 'membership-term-versions',
      data: { version: `integration-${randomUUID()}`, content: 'Termo de adesão de integração.', effectiveFrom: new Date(Date.now() - 60_000).toISOString(), status: 'PUBLISHED' },
      overrideAccess: true,
    })
    termId = term.id
  })

  afterAll(async () => {
    if (!payload) return

    if (volunteerId) {
      await payload.delete({ collection: 'audit-events', where: { targetId: { equals: volunteerId } }, overrideAccess: true })
      await payload.delete({ collection: 'volunteer-term-acceptances', where: { volunteer: { equals: volunteerId } }, overrideAccess: true })
      await payload.delete({ collection: 'volunteer-files', where: { volunteer: { equals: volunteerId } }, overrideAccess: true })
      await payload.delete({ collection: 'volunteers', id: volunteerId, overrideAccess: true })
    }
    if (invitationId) {
      await payload.delete({ collection: 'audit-events', where: { targetId: { equals: invitationId } }, overrideAccess: true })
      await payload.delete({ collection: 'volunteer-files', where: { invitation: { equals: invitationId } }, overrideAccess: true })
      await payload.delete({ collection: 'volunteer-invitations', id: invitationId, overrideAccess: true })
    }
    if (termId) await payload.delete({ collection: 'membership-term-versions', id: termId, overrideAccess: true })
    if (adminUserId) await payload.delete({ collection: 'users', id: adminUserId, overrideAccess: true })
    await payload.destroy()
  })

  it('persists invitation, uploads, acceptance evidence, volunteer and audit trail', async () => {
    const adminContext = { payload, user: { id: adminUserId, role: 'Admin' } }
    const invitation = await createInvitation(adminContext, { expiresAt: new Date(Date.now() + 3_600_000).toISOString() })
    const token = invitation.url.split('/').at(-1)!

    const publicContext = { payload, req: { payload }, ipAddress: '203.0.113.10', userAgent: 'integration-test/1.0', r2 }
    const publicInvitation = await getPublicInvitation(publicContext, token)
    invitationId = publicInvitation.invitationId

    const fileInputs: Array<['PERSONAL_PHOTO' | 'IDENTITY_DOCUMENT', string, number]> = [
      ['PERSONAL_PHOTO', 'image/jpeg', 321],
      ['IDENTITY_DOCUMENT', 'application/pdf', 654],
    ]
    const files = await Promise.all(fileInputs.map(async ([purpose, mimeType, sizeBytes]) => {
      const intent = await createUploadIntent(publicContext, token, { submissionId: publicInvitation.submissionId, purpose: purpose as any, mimeType, sizeBytes: sizeBytes as number, sha256: 'a'.repeat(64) })
      await confirmUpload(publicContext, token, { fileId: intent.fileId })
      return intent
    }))

    const submission = await submitRegistration(publicContext, token, {
      submissionId: publicInvitation.submissionId,
      termVersionId: publicInvitation.term.id,
      termContentHash: publicInvitation.term.contentHash,
      statement: ACCEPTANCE_STATEMENT,
      fullName: 'Maria da Silva',
      birthDate: '1990-01-02',
      cpf: '123.456.789-09',
      rg: '12.345.678-9',
      rgIssuer: 'SSP/SP',
      phone: '(19) 99999-0000',
      email: 'maria.integration@example.test',
      addressStreet: 'Rua de Integração, 10',
      addressNeighborhood: 'Centro',
      addressCity: 'Sumaré',
      addressZipcode: '13170-000',
      activityArea: 'Bem-Estar Animal',
      specificRole: 'Cuidados de canil',
      admittedAt: '2026-09-15',
      avgHoursPerMonth: 12,
    })
    volunteerId = submission.volunteerId

    const volunteer = await payload.findByID({ collection: 'volunteers', id: volunteerId, overrideAccess: true })
    const acceptance = await payload.find({ collection: 'volunteer-term-acceptances', where: { volunteer: { equals: volunteerId } }, limit: 1, overrideAccess: true })
    const storedFiles = await payload.find({ collection: 'volunteer-files', where: { volunteer: { equals: volunteerId } }, limit: 10, overrideAccess: true })
    const audit = await payload.find({ collection: 'audit-events', where: { targetId: { equals: volunteerId } }, limit: 10, overrideAccess: true })
    const storedInvitation = await payload.findByID({ collection: 'volunteer-invitations', id: invitationId, overrideAccess: true })

    expect(submission.status).toBe('PENDING_REVIEW')
    expect(volunteer.cpfMasked).toBe('***.456.789-**')
    expect(volunteer.cpfEncrypted).toBeTruthy()
    expect(volunteer.cpfBlindIndex).toHaveLength(64)
    expect(acceptance.docs[0]).toMatchObject({ ipAddress: '203.0.113.10', userAgent: 'integration-test/1.0', statement: ACCEPTANCE_STATEMENT, contentHashAtAcceptance: publicInvitation.term.contentHash, contentSnapshot: publicInvitation.term.content })
    expect(storedFiles.docs).toHaveLength(2)
    expect(storedFiles.docs.map((file: any) => file.id).sort()).toEqual(files.map((file) => file.fileId).sort())
    expect(audit.docs.some((event: any) => event.eventType === 'VOLUNTEER_SUBMITTED')).toBe(true)
    expect(storedInvitation.status).toBe('EXHAUSTED')
    await expect(submitRegistration(publicContext, token, { submissionId: publicInvitation.submissionId, termVersionId: publicInvitation.term.id, termContentHash: publicInvitation.term.contentHash, statement: ACCEPTANCE_STATEMENT })).rejects.toMatchObject({ code: 'INVITATION_INVALID' })
  })
})
