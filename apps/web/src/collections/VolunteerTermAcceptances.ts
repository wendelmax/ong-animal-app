import type { CollectionConfig } from 'payload'

export const VolunteerTermAcceptances: CollectionConfig = {
  slug: 'volunteer-term-acceptances',
  labels: { singular: 'Aceite de termo', plural: 'Aceites de termos' },
  admin: { useAsTitle: 'acceptedAt', group: 'Administração' },
  access: { read: ({ req: { user } }) => user?.role === 'Admin', create: () => false, update: () => false, delete: () => false },
  fields: [
    { name: 'volunteer', type: 'relationship', relationTo: 'volunteers', required: true, admin: { readOnly: true } },
    { name: 'termVersion', type: 'relationship', relationTo: 'membership-term-versions', required: true, admin: { readOnly: true } },
    { name: 'acceptedAt', type: 'date', required: true, admin: { readOnly: true } },
    { name: 'ipAddress', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'userAgent', type: 'textarea', required: true, admin: { readOnly: true } },
    { name: 'contentHashAtAcceptance', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'statement', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'signedDocument', type: 'text', admin: { readOnly: true } },
  ],
}

