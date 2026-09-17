import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { VolunteerPrintableTerm } from '@/components/VolunteerPrintableTerm'

describe('VolunteerPrintableTerm', () => {
  it('renders the local logo, evidence metadata and printable controls', () => {
    const element = React.createElement(VolunteerPrintableTerm, { volunteer: { fullName: 'Ana', cpf: '***.456.789-**' }, acceptance: { acceptedAt: '2026-09-16T12:00:00.000Z', ipAddress: '203.0.113.10', userAgent: 'test-agent', statement: 'Li e concordo com os termos de adesão e tratamento de dados' }, renderedContent: 'TERMO\nAna', term: { version: '2026.2-CGE', contentHash: 'a'.repeat(64) }, showFullCpf: false, logoSrc: '/logo.png' })
    const html = renderToStaticMarkup(element)
    expect(html).toContain('src="/logo.png"')
    expect(html).toContain('2026.2-CGE')
    expect(html).toContain('a'.repeat(64))
    expect(html).toContain('Li e concordo com os termos de adesão e tratamento de dados')
    expect(html).toContain('print-controls')
    expect(html).toContain('Imprimir')
    expect(html).toContain('***.456.789-**')
  })
})
