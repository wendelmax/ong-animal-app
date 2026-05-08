import type { CollectionConfig } from 'payload'

export const Animals: CollectionConfig = {
  slug: 'animals',
  admin: {
    useAsTitle: 'nome',
  },
  fields: [
    {
      name: 'nome',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'especie',
      type: 'select',
      options: ['Cachorro', 'Gato', 'Outro'],
      required: true,
    },
    {
      name: 'sexo',
      type: 'select',
      options: ['Macho', 'Fêmea'],
      required: true,
    },
    {
      name: 'porte',
      type: 'select',
      options: ['Pequeno', 'Médio', 'Grande'],
      required: true,
    },
    {
      name: 'idade',
      type: 'number',
    },
    {
      name: 'peso',
      type: 'number',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        'Resgatado',
        'Em tratamento',
        'Lar temporário',
        'Disponível',
        'Em adaptação',
        'Adotado',
        'Falecido',
      ],
      required: true,
      defaultValue: 'Resgatado',
    },
    {
      name: 'descricao',
      type: 'textarea',
    },
    {
      name: 'historia',
      type: 'richText',
    },
    {
      name: 'castrado',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'vacinado',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'vermifugado',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'microchipado',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'fotos',
      type: 'array',
      fields: [
        {
          name: 'foto',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'dataResgate',
      type: 'date',
    },
  ],
}
