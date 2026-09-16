import type { CollectionConfig } from 'payload'

const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN)
const blobHost =
  process.env.BLOB_STORAGE_URL || 'https://qhu14etz7tk70zzr.public.blob.vercel-storage.com'

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
    create: ({ req: { user } }) =>
      Boolean(
        user?.role === 'Admin' ||
        user?.role === 'Marketing' ||
        user?.role === 'Voluntário' ||
        user?.role === 'Veterinário',
      ),
    update: ({ req: { user } }) =>
      Boolean(
        user?.role === 'Admin' ||
        user?.role === 'Marketing' ||
        user?.role === 'Voluntário' ||
        user?.role === 'Veterinário',
      ),
    delete: ({ req: { user } }) => Boolean(user?.role === 'Admin'),
  },
  hooks: {
    afterRead: [
      ({ doc }) => {
        // Se já possui URL externa válida, mantém
        if (doc.url && (doc.url.startsWith('http://') || doc.url.startsWith('https://'))) {
          return doc
        }
        // Se estiver em produção com Blob e tiver filename
        if (hasBlobToken && doc.filename) {
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
      label: 'Texto Alternativo (Acessibilidade)',
    },
  ],
  upload: {
    // Permite armazenamento local quando executado em desenvolvimento sem token do Vercel Blob
    disableLocalStorage: hasBlobToken,
    mimeTypes: ['image/*', 'application/pdf'],
  },
}
