import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: 'Notícia',
    plural: 'Notícias',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Conteúdo',
    defaultColumns: ['title', 'slug', 'publishedAt', 'category'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user?.role === 'Admin' || user?.role === 'Marketing'),
    update: ({ req: { user } }) => Boolean(user?.role === 'Admin' || user?.role === 'Marketing'),
    delete: ({ req: { user } }) => Boolean(user?.role === 'Admin'),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Título da Postagem',
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug (URL amigável)',
      index: true,
      admin: {
        description: 'Identificador único na URL (ex: feira-de-adocao-sumare). Se vazio, será preenchido automaticamente a partir do título.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title) {
              return (data.title as string)
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Resumo Breve',
      admin: {
        description: 'Um resumo curto para aparecer no feed de notícias na página inicial e listagem.',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Categoria',
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagem de Capa',
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Data de Publicação',
      defaultValue: () => new Date().toISOString(),
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Conteúdo',
      required: true,
    },
  ],
}
