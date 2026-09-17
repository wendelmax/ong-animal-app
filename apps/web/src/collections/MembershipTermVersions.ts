import { createHash } from 'node:crypto'
import type { CollectionConfig, CollectionBeforeChangeHook } from 'payload'
import { validateVolunteerTermTemplate } from '../lib/volunteer-registration/term-template'

const adminOnly = ({ req: { user } }: any) => user?.role === 'Admin'
const hashContent: CollectionBeforeChangeHook = ({ data }) => ({ ...data, contentHash: createHash('sha256').update(String(data.content || '').normalize('NFC'), 'utf8').digest('hex') })
const validatePublishedTemplate: CollectionBeforeChangeHook = ({ data }) => {
  if (data.status === 'PUBLISHED') {
    const validation = validateVolunteerTermTemplate(String(data.content || ''))
    if (!validation.valid) throw new Error(`UNKNOWN_TERM_PLACEHOLDER:${validation.unknownTags.join(',')}`)
  }
  return data
}
const rejectPublishedMutation: CollectionBeforeChangeHook = ({ data, originalDoc, operation }) => {
  if (operation === 'update' && ['PUBLISHED', 'RETIRED'].includes(originalDoc?.status)) {
    throw new Error('TERM_VERSION_IMMUTABLE')
  }
  return data
}
const rejectPublishedDeletion = async ({ req, id }: any) => {
  const existing = await req.payload.findByID({ collection: 'membership-term-versions', id, overrideAccess: true, req })
  if (['PUBLISHED', 'RETIRED'].includes(existing?.status)) throw new Error('TERM_VERSION_IMMUTABLE')
  return true
}

export const MembershipTermVersions: CollectionConfig = {
  slug: 'membership-term-versions',
  labels: { singular: 'Versão do termo', plural: 'Versões dos termos' },
  admin: { useAsTitle: 'version', group: 'Administração' },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: async (args) => adminOnly(args) && rejectPublishedDeletion(args) },
  hooks: { beforeChange: [rejectPublishedMutation, validatePublishedTemplate, hashContent] },
  fields: [
    { name: 'version', type: 'text', required: true, unique: true },
    { name: 'content', type: 'textarea', required: true },
    { name: 'contentHash', type: 'text', required: true, minLength: 64, maxLength: 64, admin: { readOnly: true } },
    { name: 'documentKey', type: 'text', admin: { readOnly: true } },
    { name: 'effectiveFrom', type: 'date', required: true },
    { name: 'effectiveUntil', type: 'date' },
    { name: 'status', type: 'select', required: true, defaultValue: 'DRAFT', options: ['DRAFT', 'PUBLISHED', 'RETIRED'] },
  ],
}
