import type { GlobalConfig } from 'payload'

export const Footer: GlobalConfig = {
  slug: 'footer',
  admin: {
    group: 'Site (Conteúdo)',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user?.role === 'Admin' || user?.role === 'Marketing'),
  },
  fields: [
    {
      name: 'copyright',
      type: 'text',
      label: 'Texto de Copyright',
      defaultValue: '© 2026 Associação Viralatinhas de Sumaré.',
    },
    {
      name: 'socialLinks',
      type: 'array',
      label: 'Redes Sociais',
      fields: [
        {
          name: 'platform',
          type: 'select',
          options: ['Instagram', 'Facebook', 'Twitter', 'YouTube'],
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          label: 'URL do Perfil',
        },
      ],
    },
  ],
}
