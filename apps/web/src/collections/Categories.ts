import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'title',
    group: 'Site (Conteúdo)',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user?.role === 'Admin' || user?.role === 'Marketing'),
    create: ({ req: { user } }) => Boolean(user?.role === 'Admin' || user?.role === 'Marketing'),
    update: ({ req: { user } }) => Boolean(user?.role === 'Admin' || user?.role === 'Marketing'),
    delete: ({ req: { user } }) => Boolean(user?.role === 'Admin'),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Nome da Categoria',
    },
  ],
}
