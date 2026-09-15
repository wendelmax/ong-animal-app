import type { CollectionConfig } from 'payload'

export const Transactions: CollectionConfig = {
  slug: 'transactions',
  labels: {
    singular: 'Transação',
    plural: 'Finanças',
  },
  admin: {
    useAsTitle: 'descricao',
    description: 'Controle financeiro e doações',
    group: 'Financeiro',
    defaultColumns: ['data', 'descricao', 'tipo', 'valor', 'categoria', 'visivelNoSite'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'Admin' || user?.role === 'Financeiro') return true
      return {
        visivelNoSite: {
          equals: true,
        },
      }
    },
    create: ({ req: { user } }) => Boolean(user?.role === 'Admin' || user?.role === 'Financeiro'),
    update: ({ req: { user } }) => Boolean(user?.role === 'Admin' || user?.role === 'Financeiro'),
    delete: ({ req: { user } }) => Boolean(user?.role === 'Admin'),
  },
  fields: [
    {
      name: 'animal',
      type: 'relationship',
      relationTo: 'animals',
      label: 'Relacionado ao Animal (opcional)',
      admin: {
        description: 'Vincule este gasto ou receita a um animal específico para controle de custo.',
      },
    },
    {
      name: 'tipo',
      type: 'select',
      label: 'Tipo de Lançamento',
      options: [
        { label: 'Receita (Entrada)', value: 'Receita' },
        { label: 'Despesa (Saída)', value: 'Despesa' },
        { label: 'Doação (PIX/Dinheiro)', value: 'Doação' },
      ],
      required: true,
    },
    {
      name: 'valor',
      type: 'number',
      label: 'Valor (R$)',
      required: true,
    },
    {
      name: 'descricao',
      type: 'text',
      label: 'Descrição / Motivo',
      required: true,
    },
    {
      name: 'categoria',
      type: 'select',
      label: 'Categoria',
      options: [
        'Ração',
        'Veterinário/Consulta',
        'Medicamentos',
        'Exames',
        'Transporte',
        'Banho/Tosa',
        'Evento/Rifa',
        'Apadrinhamento',
        'Infraestrutura',
        'Outros',
      ],
    },
    {
      name: 'data',
      type: 'date',
      label: 'Data do Lançamento',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'visivelNoSite',
      type: 'checkbox',
      label: 'Exibir no Portal da Transparência',
      defaultValue: true,
      admin: {
        description: 'Desmarque caso este lançamento seja interno ou confidencial.',
      },
    },
    {
      name: 'comprovante',
      type: 'upload',
      relationTo: 'media',
      label: 'Anexo de Comprovante',
    },
  ],
}
