import type { CollectionConfig } from 'payload'

export const AdoptionRequests: CollectionConfig = {
  slug: 'adoption-requests',
  labels: {
    singular: 'Pedido de Adoção',
    plural: 'Pedidos de Adoção',
  },
  admin: {
    useAsTitle: 'nome',
    group: 'Adoções',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user?.role === 'Admin' || user?.role === 'Voluntário'),
    create: ({ req: { user } }) => true, // Público (pode vir do site)
    update: ({ req: { user } }) => Boolean(user?.role === 'Admin' || user?.role === 'Voluntário'),
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
      name: 'nome',
      type: 'text',
      required: true,
    },
    {
      name: 'telefone',
      type: 'text',
      required: true,
    },
    {
      name: 'cidade',
      type: 'text',
      required: true,
    },
    {
      name: 'endereco',
      type: 'textarea',
      required: true,
    },
    {
      name: 'tipoResidencia',
      type: 'select',
      options: ['Casa', 'Apartamento', 'Chácara/Sítio'],
      required: true,
    },
    {
      name: 'possuiOutrosAnimais',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'possuiTelaProtecao',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'observacoes',
      type: 'textarea',
    },
    {
      name: 'status',
      type: 'select',
      options: ['Interessado', 'Entrevista', 'Análise', 'Aprovado', 'Adaptação', 'Adotado', 'Reprovado'],
      defaultValue: 'Interessado',
      required: true,
    },
    {
      name: 'documentos',
      type: 'array',
      fields: [
        {
          name: 'documento',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
}
