import type { CollectionConfig } from 'payload'

const adminOnly = ({ req: { user } }: any) => user?.role === 'Admin'

export const MembershipTermVersions: CollectionConfig = {
  slug: 'membership-term-versions',
  labels: { singular: 'Versão do termo', plural: 'Versões dos termos' },
  admin: { useAsTitle: 'version', group: 'Administração' },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'version', type: 'text', required: true, unique: true },
    { name: 'content', type: 'textarea', required: true },
    { name: 'contentHash', type: 'text', required: true, minLength: 64, maxLength: 64, admin: { readOnly: true } },
    { name: 'documentKey', type: 'text', admin: { readOnly: true } },
    { name: 'effectiveFrom', type: 'date', required: true },
    { name: 'effectiveUntil', type: 'date' },
    { name: 'status', type: 'select', required: true, defaultValue: 'DRAFT', options: ['DRAFT', 'PUBLISHED', 'RETIRED'] },
  ],
}

