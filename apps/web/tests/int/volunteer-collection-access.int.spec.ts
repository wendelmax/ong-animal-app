import { describe, expect, it } from 'vitest'

import {
  canDownloadVolunteerFile,
  canManageVolunteerInvitations,
  canReadVolunteerContact,
  canReadVolunteerPrivateData,
  canReadVolunteerCpf,
  canUpdateVolunteerProtectedFields,
  canReviewVolunteer,
} from '@/lib/volunteer-registration/access'

describe('volunteer collection access', () => {
  it('permite convite e revisão para Admin e Volunteer Manager', () => {
    expect(canManageVolunteerInvitations({ role: 'Admin' })).toBe(true)
    expect(canManageVolunteerInvitations({ role: 'VOLUNTEER_MANAGER' })).toBe(true)
    expect(canReviewVolunteer({ role: 'COMPLIANCE_OFFICER' })).toBe(true)
    expect(canManageVolunteerInvitations({ role: 'Voluntário' })).toBe(false)
  })

  it('restringe download de documento a compliance, jurídico e Admin', () => {
    expect(canDownloadVolunteerFile({ role: 'Admin' })).toBe(true)
    expect(canDownloadVolunteerFile({ role: 'COMPLIANCE_OFFICER' })).toBe(true)
    expect(canDownloadVolunteerFile({ role: 'LEGAL_DIRECTOR' })).toBe(true)
    expect(canDownloadVolunteerFile({ role: 'VOLUNTEER_MANAGER' })).toBe(false)
  })

  it('mantém papéis existentes sem acesso sensível', () => {
    for (const role of ['Financeiro', 'Veterinário', 'Voluntário', 'Marketing']) {
      expect(canReadVolunteerContact({ role })).toBe(false)
      expect(canDownloadVolunteerFile({ role })).toBe(false)
    }
    expect(canReadVolunteerContact(null)).toBe(false)
    expect(canReviewVolunteer(undefined)).toBe(false)
  })

  it('separa PII privada, CPF e campos protegidos do gerente operacional', () => {
    expect(canReadVolunteerPrivateData({ role: 'VOLUNTEER_MANAGER' })).toBe(false)
    expect(canReadVolunteerPrivateData({ role: 'COMPLIANCE_OFFICER' })).toBe(true)
    expect(canReadVolunteerCpf({ role: 'VOLUNTEER_MANAGER' })).toBe(false)
    expect(canReadVolunteerCpf({ role: 'LEGAL_DIRECTOR' })).toBe(true)
    expect(canUpdateVolunteerProtectedFields({ role: 'VOLUNTEER_MANAGER' })).toBe(false)
    expect(canUpdateVolunteerProtectedFields({ role: 'COMPLIANCE_OFFICER' })).toBe(true)
  })
})
