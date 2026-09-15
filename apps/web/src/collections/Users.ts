import type { CollectionConfig } from 'payload'
import type { User } from '../payload-types'

const isAdmin = ({ req: { user } }: { req: { user: User | null | any } }) => {
  return Boolean(user?.role === 'Admin')
}

const isAdminOrSelf = ({ req: { user } }: { req: { user: User | null | any } }) => {
  if (!user) return false
  if (user.role === 'Admin') return true
  return {
    id: {
      equals: user.id,
    },
  }
}

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Usuário',
    plural: 'Usuários',
  },
  admin: {
    useAsTitle: 'email',
    group: 'Administração',
    defaultColumns: ['name', 'email', 'role'],
  },
  auth: true,
  access: {
    read: isAdminOrSelf,
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdmin,
    admin: () => true, // Permite acesso ao painel para roles cadastrados
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
      options: ['Admin', 'VOLUNTEER_MANAGER', 'COMPLIANCE_OFFICER', 'LEGAL_DIRECTOR', 'Financeiro', 'Veterinário', 'Voluntário', 'Marketing'],
      required: true,
      defaultValue: 'Voluntário',
      access: {
        update: isAdmin, // Apenas administradores podem alterar o nível de permissão
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
