import type { CollectionConfig } from 'payload'
import type { User } from '../payload-types'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    description: 'Organizações parceiras e ONGs usando a plataforma (White Label).',
    group: 'Administração',
  },
  access: {
    read: ({ req: { user } }) => Boolean((user as unknown as User)?.role === 'Admin'),
    create: ({ req: { user } }) => Boolean((user as unknown as User)?.role === 'Admin'),
    update: ({ req: { user } }) => Boolean((user as unknown as User)?.role === 'Admin'),
    delete: ({ req: { user } }) => Boolean((user as unknown as User)?.role === 'Admin'),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nome da Organização/ONG',
    },
    {
      name: 'domain',
      type: 'text',
      unique: true,
      label: 'Domínio (ex: ong.com.br)',
      admin: {
        description: 'Usado para resolver a interface da ONG correta baseado no subdomínio/domínio.',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'primaryColor',
      type: 'text',
      defaultValue: '#f97316',
      admin: {
        description: 'Cor principal em HEX (ex: #f97316)',
      },
    },
  ],
}
