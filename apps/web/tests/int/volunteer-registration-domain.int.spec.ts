import { describe, expect, it } from 'vitest'

import { normalizeCpf, maskCpf, createCpfBlindIndex } from '@/lib/volunteer-registration/cpf'
import { evaluateInvitation, isTermCurrentlyEffective } from '@/lib/volunteer-registration/validation'
import { validateVolunteerFile } from '@/lib/volunteer-registration/validation'
import { createInvitationSecret } from '@/lib/volunteer-registration/tokens'
import type { FilePurpose, InvitationStatus } from '@/lib/volunteer-registration/types'

describe('volunteer registration domain primitives', () => {
  it('gera segredo de convite não previsível e guarda somente o hash', () => {
    const result = createInvitationSecret()

    expect(result.rawToken).toHaveLength(64)
    expect(result.tokenHash).toHaveLength(64)
    expect(result.tokenHash).not.toBe(result.rawToken)
  })

  it('mascara e cria blind index determinístico sem retornar CPF', () => {
    expect(maskCpf('12345678909')).toBe('***.456.789-**')
    expect(createCpfBlindIndex('123.456.789-09', 'pepper')).toHaveLength(64)
    expect(createCpfBlindIndex('123.456.789-09', 'pepper')).toBe(
      createCpfBlindIndex('12345678909', 'pepper'),
    )
  })

  it('aceita foto JPEG até 10 MB e rejeita executável ou excesso', () => {
    expect(
      validateVolunteerFile({
        purpose: 'PERSONAL_PHOTO',
        mimeType: 'image/jpeg',
        sizeBytes: 10_000_000,
        sha256: 'a'.repeat(64),
      }).valid,
    ).toBe(true)
    expect(
      validateVolunteerFile({
        purpose: 'IDENTITY_DOCUMENT',
        mimeType: 'application/x-msdownload',
        sizeBytes: 100,
        sha256: 'a'.repeat(64),
      }).valid,
    ).toBe(false)
    expect(
      validateVolunteerFile({
        purpose: 'PERSONAL_PHOTO',
        mimeType: 'image/png',
        sizeBytes: 10_000_001,
        sha256: 'a'.repeat(64),
      }).valid,
    ).toBe(false)
  })

  it('aceita convite ativo ainda não expirado e dentro do limite de uso', () => {
    expect(
      evaluateInvitation({
        status: 'ACTIVE',
        expiresAt: '2026-09-15T12:00:01.000Z',
        usedCount: 0,
        maxUses: 1,
        now: new Date('2026-09-15T12:00:00.000Z'),
      }),
    ).toEqual({ valid: true, publicStatus: 'ACTIVE' })
  })

  it.each([
    ['expired', { status: 'ACTIVE', expiresAt: '2026-09-15T11:59:59.000Z' }],
    ['revoked', { status: 'REVOKED', expiresAt: '2026-09-15T12:00:01.000Z' }],
    ['exhausted', { status: 'ACTIVE', expiresAt: '2026-09-15T12:00:01.000Z', usedCount: 1 }],
  ])('returns a generic invalid result for an %s invitation', (_, overrides) => {
    expect(
      evaluateInvitation({
        status: overrides.status as InvitationStatus,
        expiresAt: overrides.expiresAt,
        usedCount: 'usedCount' in overrides ? overrides.usedCount : 0,
        maxUses: 1,
        now: new Date('2026-09-15T12:00:00.000Z'),
      }),
    ).toEqual({ valid: false, publicStatus: 'INVALID' })
  })

  it('rejects a CPF that does not normalize to exactly eleven digits', () => {
    expect(() => normalizeCpf('123.456.789-0')).toThrow('INVALID_CPF')
    expect(() => normalizeCpf('123.456.789-0a')).toThrow('INVALID_CPF')
  })

  it('rejects invalid file checksums with the required code', () => {
    expect(
      validateVolunteerFile({
        purpose: 'PERSONAL_PHOTO',
        mimeType: 'image/jpeg',
        sizeBytes: 100,
        sha256: 'A'.repeat(64),
      }),
    ).toEqual({ valid: false, error: 'INVALID_CHECKSUM' })
  })

  it('rejects an unsupported file purpose with the required code', () => {
    expect(
      validateVolunteerFile({
        purpose: 'OTHER' as FilePurpose,
        mimeType: 'image/jpeg',
        sizeBytes: 100,
        sha256: 'a'.repeat(64),
      }),
    ).toEqual({ valid: false, error: 'WRONG_PURPOSE' })
  })

  it('considera somente o termo publicado dentro da janela de vigência', () => {
    expect(isTermCurrentlyEffective({ status: 'PUBLISHED', effectiveFrom: '2026-09-15T11:00:00.000Z', effectiveUntil: '2026-09-15T13:00:00.000Z' }, new Date('2026-09-15T12:00:00.000Z'))).toBe(true)
    expect(isTermCurrentlyEffective({ status: 'PUBLISHED', effectiveFrom: '2026-09-15T11:00:00.000Z', effectiveUntil: '2026-09-15T11:59:59.000Z' }, new Date('2026-09-15T12:00:00.000Z'))).toBe(false)
    expect(isTermCurrentlyEffective({ status: 'DRAFT', effectiveFrom: '2026-09-15T11:00:00.000Z' }, new Date('2026-09-15T12:00:00.000Z'))).toBe(false)
  })
})
