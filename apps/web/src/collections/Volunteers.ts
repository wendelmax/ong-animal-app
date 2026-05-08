import type { CollectionConfig } from 'payload'

export const Volunteers: CollectionConfig = {
  slug: 'volunteers',
  admin: {
    useAsTitle: 'nome',
    description: 'Cadastro de voluntários da ONG',
    group: 'Administração',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user?.role === 'Admin'),
    create: ({ req: { user } }) => Boolean(user?.role === 'Admin'),
    update: ({ req: { user } }) => Boolean(user?.role === 'Admin'),
    delete: ({ req: { user } }) => Boolean(user?.role === 'Admin'),
  },
  fields: [
    {
      name: 'nome',
      type: 'text',
      required: true,
    },
    {
      name: 'contato',
      type: 'text',
      required: true,
    },
    {
      name: 'funcao',
      type: 'select',
      options: ['Resgate', 'Lar Temporário', 'Transporte', 'Eventos', 'Administrativo'],
      required: true,
    },
    {
      name: 'disponibilidade',
      type: 'text',
    },
    {
      name: 'ativo',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
