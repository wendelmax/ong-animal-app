import type { CollectionConfig } from 'payload'
import { canManageVolunteerInvitations } from '../lib/volunteer-registration/access'

const allowed = ({ req: { user } }: any) => canManageVolunteerInvitations(user)

export const VolunteerInvitations: CollectionConfig = {
  slug: 'volunteer-invitations',
  labels: { singular: 'Convite de voluntário', plural: 'Convites de voluntários' },
  admin: { useAsTitle: 'status', group: 'Pessoas', description: 'Links públicos para cadastro de voluntários', components: { beforeList: ['/components/Admin/VolunteerInvitationActions'] } },
  access: {
    read: allowed,
    create: allowed,
    update: allowed,
    delete: ({ req: { user } }) => user?.role === 'Admin',
  },
  fields: [
    { name: 'tokenHash', type: 'text', unique: true, admin: { hidden: true, readOnly: true } },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', required: true, admin: { readOnly: true } },
    { name: 'expiresAt', type: 'date', required: true },
    { name: 'maxUses', type: 'number', required: true, defaultValue: 1, min: 1, max: 10 },
    { name: 'usedCount', type: 'number', required: true, defaultValue: 0, admin: { readOnly: true } },
    { name: 'status', type: 'select', required: true, defaultValue: 'ACTIVE', options: ['ACTIVE', 'EXPIRED', 'EXHAUSTED', 'REVOKED'] },
    { name: 'lastUsedAt', type: 'date', admin: { readOnly: true } },
  ],
}
