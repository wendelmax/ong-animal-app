export const coexistenceModes = ['legacy', 'shadow', 'nodepress'] as const
export type CoexistenceMode = typeof coexistenceModes[number]

export interface CoexistenceConfig {
  mode: CoexistenceMode
  nodepressPublicUrl?: string
  nodepressAdminUrl?: string
  legacyAdminPath: string
}

export function getCoexistenceConfig(env: Partial<NodeJS.ProcessEnv> = process.env): CoexistenceConfig {
  const rawMode = env.NODEPRESS_COEXISTENCE_MODE || 'legacy'
  const mode = coexistenceModes.includes(rawMode as CoexistenceMode) ? rawMode as CoexistenceMode : 'legacy'
  return {
    mode,
    nodepressPublicUrl: env.NODEPRESS_PUBLIC_URL || undefined,
    nodepressAdminUrl: env.NODEPRESS_ADMIN_URL || undefined,
    legacyAdminPath: env.LEGACY_ADMIN_PATH || '/legacy-admin',
  }
}
