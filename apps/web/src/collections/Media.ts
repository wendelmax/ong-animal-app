import type { CollectionConfig } from 'payload'
import { uploadToBlob } from '../hooks/blobUpload'

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
    beforeChange: [uploadToBlob],
    afterRead: [
      ({ doc }) => {
        const blobHost = 'https://qhu14etz7tk70zzr.public.blob.vercel-storage.com'
        if (doc.filename) {
          doc.url = `${blobHost}/media/${doc.filename}`
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
  ],
  upload: {
    disableLocalStorage: true,
    mimeTypes: ['image/*', 'application/pdf'],
  },
}
