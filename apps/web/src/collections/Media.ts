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
    afterRead: [
      ({ doc }: { doc: any }) => {
        // Usa urlOverride se existir para apontar para o Blob
        if (doc && doc.urlOverride) {
          doc.url = doc.urlOverride
        }
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'urlOverride',
      type: 'text',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'URL persistente no Vercel Blob',
      },
    },
  ],
  upload: {
    disableLocalStorage: true,
    mimeTypes: ['image/*', 'application/pdf'],
  },
}
