import type { CollectionConfig } from 'payload'
import { uploadToBlob, deleteFromBlob } from '../hooks/blobUpload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Mídia',
    plural: 'Mídias',
  },
  admin: {
    group: 'Conteúdo',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user?.role === 'Admin' || user?.role === 'Marketing' || user?.role === 'Voluntário' || user?.role === 'Veterinário'),
    update: ({ req: { user } }) => Boolean(user?.role === 'Admin' || user?.role === 'Marketing' || user?.role === 'Voluntário' || user?.role === 'Veterinário'),
    delete: ({ req: { user } }) => Boolean(user?.role === 'Admin'),
  },
  hooks: {
    afterChange: [uploadToBlob],
    afterDelete: [deleteFromBlob],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    disableLocalStorage: true,
    mimeTypes: ['image/*', 'application/pdf'],
  },
}
