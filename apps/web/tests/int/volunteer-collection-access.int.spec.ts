import { describe, expect, it } from 'vitest'

import {
  canDownloadVolunteerFile,
  canManageVolunteerInvitations,
  canReadVolunteerContact,
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
})
