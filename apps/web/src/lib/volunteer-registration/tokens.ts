import { createHash, randomBytes } from 'node:crypto'

export function createInvitationSecret(): { rawToken: string; tokenHash: string } {
  const rawToken = randomBytes(32).toString('hex')
  const tokenHash = createHash('sha256').update(rawToken, 'utf8').digest('hex')

  return { rawToken, tokenHash }
}
