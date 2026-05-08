import type { CollectionConfig } from 'payload'

export const DocumentTemplates: CollectionConfig = {
  slug: 'document-templates',
  admin: {
    useAsTitle: 'title',
    description: 'Modelos de documentos e termos (Adoção, Voluntariado, etc)',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user?.role === 'Admin'),
    update: ({ req: { user } }) => Boolean(user?.role === 'Admin'),
    delete: ({ req: { user } }) => Boolean(user?.role === 'Admin'),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Título do Termo',
    },
    {
      name: 'type',
      type: 'select',
      options: ['Adoção', 'Voluntariado', 'Outro'],
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      admin: {
        description: 'Use placeholders como {nome_adotante}, {nome_animal}, {data_atual}.',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: 'Ativo',
    },
  ],
}
