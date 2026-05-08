import type { CollectionConfig } from 'payload'
import type { User } from '../payload-types'

const isAdmin = ({ req: { user } }: { req: { user: User | null | any } }) => {
  return Boolean(user?.role === 'Admin')
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'Administração',
  },
  auth: true,
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    admin: () => true, // Allows login to admin panel. Can be refined later based on roles.
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      options: ['Admin', 'Financeiro', 'Veterinário', 'Voluntário', 'Marketing'],
      required: true,
      defaultValue: 'Voluntário',
      access: {
        update: isAdmin, // only admins can change roles
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      hasMany: false,
      admin: {
        description: 'Qual organização este usuário pertence (White Label).',
      },
    },
  ],
}
