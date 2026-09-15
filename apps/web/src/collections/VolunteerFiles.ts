import type { CollectionConfig } from 'payload'

export const VolunteerFiles: CollectionConfig = {
  slug: 'volunteer-files',
  labels: { singular: 'Arquivo de voluntário', plural: 'Arquivos de voluntários' },
  admin: { useAsTitle: 'purpose', group: 'Pessoas' },
  access: {
    read: ({ req: { user } }) => ['Admin', 'COMPLIANCE_OFFICER', 'LEGAL_DIRECTOR'].includes(user?.role as string),
    create: () => false,
    update: () => false,
    delete: ({ req: { user } }) => user?.role === 'Admin',
  },
  fields: [
    { name: 'volunteer', type: 'relationship', relationTo: 'volunteers', admin: { readOnly: true } },
    { name: 'invitation', type: 'relationship', relationTo: 'volunteer-invitations', required: true, admin: { readOnly: true } },
    { name: 'submissionId', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'purpose', type: 'select', required: true, options: ['PERSONAL_PHOTO', 'IDENTITY_DOCUMENT'] },
    { name: 'storageProvider', type: 'select', required: true, defaultValue: 'R2', options: ['R2'] },
    { name: 'objectKey', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'mimeType', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'sizeBytes', type: 'number', required: true, admin: { readOnly: true } },
    { name: 'sha256', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'uploadStatus', type: 'select', required: true, defaultValue: 'PENDING', options: ['PENDING', 'UPLOADED', 'REJECTED', 'DELETED'] },
    { name: 'uploadedAt', type: 'date', admin: { readOnly: true } },
  ],
}

