import type { CollectionConfig } from 'payload'

export const Volunteers: CollectionConfig = {
  slug: 'volunteers',
  labels: {
    singular: 'Voluntário',
    plural: 'Voluntários',
  },
  admin: {
    useAsTitle: 'nome',
    description: 'Cadastro de voluntários da ONG',
    group: 'Pessoas',
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
      name: 'whatsapp',
      type: 'text',
      label: 'WhatsApp',
      required: true,
    },
    {
      name: 'isLT',
      type: 'checkbox',
      label: 'Disponível para Lar Temporário (LT)?',
      defaultValue: false,
    },
    {
      name: 'capacidadeLT',
      type: 'number',
      label: 'Capacidade de Hospedagem (Animais)',
      admin: {
        condition: (data) => Boolean(data.isLT),
      },
    },
    {
      name: 'endereco',
      type: 'textarea',
      label: 'Endereço Completo',
    },
    {
      name: 'cidade',
      type: 'text',
      label: 'Cidade',
      defaultValue: 'Sumaré',
    },
    {
      name: 'funcao',
      type: 'select',
      label: 'Função Principal',
      options: ['Resgate', 'Lar Temporário', 'Transporte', 'Eventos', 'Administrativo', 'Marketing'],
      required: true,
    },
    {
      name: 'disponibilidade',
      type: 'text',
      label: 'Disponibilidade (Dias/Horários)',
    },
    {
      name: 'ativo',
      type: 'checkbox',
      label: 'Voluntário Ativo',
      defaultValue: true,
    },
  ],
}
