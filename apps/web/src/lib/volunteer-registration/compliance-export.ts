export type VolunteerComplianceRow = {
  fullName: string
  cpfFormatted: string
  activityArea: string
  specificRole: string
  joinedAt: string
  resignedAt: string
  avgHoursPerMonth: string
  status: string
}

type CgeCsvOptions = { includeCpf: boolean }

const HEADER = ['Nome Completo', 'CPF', 'Área de Atuação', 'Função Específica', 'Data de Ingresso', 'Data de Desligamento', 'Horas/Mês', 'Status']
const maskCpf = (value: string) => {
  if (value.includes('*')) return value
  const digits = value.replace(/\D/g, '')
  return digits.length === 11 ? `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**` : '***.***.***-**'
}
const escapeCsv = (value: unknown) => {
  const text = String(value ?? '')
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function buildVolunteerCgeCsv(rows: VolunteerComplianceRow[], options: CgeCsvOptions) {
  const lines = [HEADER, ...rows.map((row) => [row.fullName, options.includeCpf ? row.cpfFormatted : maskCpf(row.cpfFormatted), row.activityArea, row.specificRole, row.joinedAt, row.resignedAt, row.avgHoursPerMonth, row.status])]
  return { csv: `\uFEFF${lines.map((line) => line.map(escapeCsv).join(',')).join('\r\n')}\r\n`, recordsCount: rows.length }
}
