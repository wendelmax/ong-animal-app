import { createHmac } from 'node:crypto'

const INVALID_CPF = 'INVALID_CPF'

export function normalizeCpf(value: string): string {
  const normalized = value.replace(/\D/g, '')

  if (normalized.length !== 11) {
    throw new Error(INVALID_CPF)
  }

  return normalized
}

export function maskCpf(value: string): string {
  const normalized = normalizeCpf(value)

  return `***.${normalized.slice(3, 6)}.${normalized.slice(6, 9)}-**`
}

export function createCpfBlindIndex(value: string, pepper: string): string {
  return createHmac('sha256', pepper).update(normalizeCpf(value), 'utf8').digest('hex')
}
