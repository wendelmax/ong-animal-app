import { describe, expect, it } from 'vitest'

import { getCoexistenceConfig } from '@/lib/nodepress-migration/coexistence'

describe('NodePress coexistence configuration', () => {
  it('uses legacy routing by default', () => {
    expect(getCoexistenceConfig({})).toEqual({
      mode: 'legacy',
      legacyAdminPath: '/legacy-admin',
    })
  })

  it('preserves an explicitly configured shadow mode', () => {
    expect(
      getCoexistenceConfig({
        NODEPRESS_COEXISTENCE_MODE: 'shadow',
        NODEPRESS_PUBLIC_URL: 'https://nodepress.example.org',
        NODEPRESS_ADMIN_URL: 'https://nodepress.example.org/admin',
        LEGACY_ADMIN_PATH: '/admin',
      }),
    ).toEqual({
      mode: 'shadow',
      nodepressPublicUrl: 'https://nodepress.example.org',
      nodepressAdminUrl: 'https://nodepress.example.org/admin',
      legacyAdminPath: '/admin',
    })
  })

  it('falls back to legacy for an unsupported mode', () => {
    expect(getCoexistenceConfig({ NODEPRESS_COEXISTENCE_MODE: 'invalid' })).toMatchObject({
      mode: 'legacy',
    })
  })
})
