import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
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
      label: 'Título da Página',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Ex: sobre-nos, como-ajudar',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: ['Rascunho', 'Publicado'],
      defaultValue: 'Rascunho',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Conteúdo da Página',
    },
  ],
}
