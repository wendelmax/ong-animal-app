import type { CollectionConfig } from 'payload'

export const AnimalEvents: CollectionConfig = {
  slug: 'animal-events',
  admin: {
    useAsTitle: 'tipo',
    group: 'Gestão Animal',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user?.role === 'Admin' || user?.role === 'Voluntário' || user?.role === 'Veterinário'),
    create: ({ req: { user } }) => Boolean(user?.role === 'Admin' || user?.role === 'Voluntário' || user?.role === 'Veterinário'),
    update: ({ req: { user } }) => Boolean(user?.role === 'Admin' || user?.role === 'Veterinário'),
    delete: ({ req: { user } }) => Boolean(user?.role === 'Admin'),
  },
  fields: [
    {
      name: 'animal',
      type: 'relationship',
      relationTo: 'animals',
      required: true,
    },
    {
      name: 'tipo',
      type: 'text',
      required: true,
    },
    {
      name: 'descricao',
      type: 'textarea',
      required: true,
    },
    {
      name: 'data',
      type: 'date',
      required: true,
    },
    {
      name: 'imagens',
      type: 'array',
      fields: [
        {
          name: 'imagem',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'publico',
      type: 'checkbox',
      defaultValue: true,
      label: 'Exibir publicamente',
    },
  ],
}
