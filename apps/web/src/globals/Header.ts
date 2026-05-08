import type { GlobalConfig } from 'payload'

export const Header: GlobalConfig = {
  slug: 'header',
  admin: {
    group: 'Site (Conteúdo)',
  },
  access: {
    read: () => true, // Público para o frontend poder ler o menu
    update: ({ req: { user } }) => Boolean(user?.role === 'Admin' || user?.role === 'Marketing'),
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      label: 'Itens do Menu',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Rótulo (ex: Sobre Nós)',
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          label: 'URL (ex: /sobre)',
        },
      ],
    },
  ],
}
