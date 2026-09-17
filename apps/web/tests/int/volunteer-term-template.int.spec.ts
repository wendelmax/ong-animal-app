import { describe, expect, it } from 'vitest'
import { renderVolunteerTerm, validateVolunteerTermTemplate, type TermRenderContext } from '@/lib/volunteer-registration/term-template'

const context: TermRenderContext = {
  term: { version: '2026.2-CGE', content_hash: 'a'.repeat(64) },
  volunteer: {
    full_name: 'Ana <Voluntária>', rg: '12.345.678-9', rg_issuer: 'SSP/SP', cpf_formatted: '***.456.789-**', birth_date: '01/02/1990',
    address_street: 'Rua das Flores', address_neighborhood: 'Centro', address_city: 'Sumaré', address_state: 'SP', address_zipcode: '13170-430', phone: '(19) 99999-9999', email: 'ana@example.com',
  },
  operational: { joined_at: '16/09/2026', activity_area: 'Bem-Estar Animal', specific_role: 'Apoio', avg_hours_per_month: '12,50' },
  acceptance: { formatted_date: '16/09/2026' },
}

describe('volunteer term template', () => {
  it('renders every approved group and preserves line breaks', () => {
    const rendered = renderVolunteerTerm('{{ term.version }}\n{{ volunteer.full_name }}\n{{ operational.activity_area }}\n{{ acceptance.formatted_date }}', context)
    expect(rendered).toBe('2026.2-CGE\nAna &lt;Voluntária&gt;\nBem-Estar Animal\n16/09/2026')
  })

  it('escapes HTML-sensitive values', () => {
    expect(renderVolunteerTerm('{{ volunteer.email }}', { ...context, volunteer: { ...context.volunteer, email: 'a&b\"<c>' } })).toBe('a&amp;b&quot;&lt;c&gt;')
  })

  it('rejects unknown placeholders and does not render them', () => {
    expect(validateVolunteerTermTemplate('{{ volunteer.full_name }} {{ volunteer.cpf }}')).toEqual({ valid: false, unknownTags: ['volunteer.cpf'] })
    expect(() => renderVolunteerTerm('{{ volunteer.cpf }}', context)).toThrow('UNKNOWN_TERM_PLACEHOLDER:volunteer.cpf')
  })
})
