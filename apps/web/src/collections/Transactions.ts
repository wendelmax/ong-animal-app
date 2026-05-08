import type { CollectionConfig } from 'payload'

export const Transactions: CollectionConfig = {
  slug: 'transactions',
  admin: {
    useAsTitle: 'descricao',
    description: 'Controle financeiro e doações',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user?.role === 'Admin' || user?.role === 'Financeiro'),
    create: ({ req: { user } }) => Boolean(user?.role === 'Admin' || user?.role === 'Financeiro'),
    update: ({ req: { user } }) => Boolean(user?.role === 'Admin' || user?.role === 'Financeiro'),
    delete: ({ req: { user } }) => Boolean(user?.role === 'Admin'),
  },
  fields: [
    {
      name: 'tipo',
      type: 'select',
      options: ['Receita', 'Despesa', 'Doação'],
      required: true,
    },
    {
      name: 'valor',
      type: 'number',
      required: true,
    },
    {
      name: 'descricao',
      type: 'text',
      required: true,
    },
    {
      name: 'categoria',
      type: 'text',
    },
    {
      name: 'data',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'comprovante',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
