import { describe, expect, it } from 'vitest'
import { buildVolunteerCgeCsv } from '@/lib/volunteer-registration/compliance-export'

describe('volunteer compliance CSV', () => {
  it('writes the regulatory header and escapes CSV values', () => {
    const result = buildVolunteerCgeCsv([{ fullName: 'Ana, "Voluntária"', cpfFormatted: '123.456.789-09', activityArea: 'Bem-estar\nAnimal', specificRole: 'Apoio', joinedAt: '16/09/2026', resignedAt: '', avgHoursPerMonth: '12,50', status: 'ACTIVE' }], { includeCpf: false })
    expect(result.recordsCount).toBe(1)
    expect(result.csv.startsWith('\uFEFFNome Completo,CPF,Área de Atuação,Função Específica,Data de Ingresso,Data de Desligamento,Horas/Mês,Status\r\n')).toBe(true)
    expect(result.csv).toContain('"Ana, ""Voluntária""",***.456.789-**,"Bem-estar\nAnimal",Apoio,16/09/2026,,"12,50",ACTIVE')
  })

  it('includes full CPF only when explicitly requested and supports empty results', () => {
    const row = { fullName: 'Ana', cpfFormatted: '123.456.789-09', activityArea: 'Resgate', specificRole: 'Apoio', joinedAt: '16/09/2026', resignedAt: '', avgHoursPerMonth: '8', status: 'ACTIVE' }
    expect(buildVolunteerCgeCsv([row], { includeCpf: true }).csv).toContain('123.456.789-09')
    const empty = buildVolunteerCgeCsv([], { includeCpf: false })
    expect(empty.recordsCount).toBe(0)
    expect(empty.csv.endsWith('\r\n')).toBe(true)
  })
})
