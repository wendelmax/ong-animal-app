import type { CollectionConfig } from 'payload'

const adminRead = ({ req: { user } }: any) => user?.role === 'Admin'

export const AuditEvents: CollectionConfig = {
  slug: 'audit-events',
  labels: { singular: 'Evento de auditoria', plural: 'Eventos de auditoria' },
  admin: { useAsTitle: 'eventType', group: 'Administração' },
  access: { read: adminRead, create: () => false, update: () => false, delete: () => false },
  fields: [
    { name: 'eventType', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'occurredAt', type: 'date', required: true, admin: { readOnly: true } },
    { name: 'actorType', type: 'select', required: true, options: ['ADMIN', 'PUBLIC_INVITATION', 'SYSTEM'], admin: { readOnly: true } },
    { name: 'actorId', type: 'text', admin: { readOnly: true } },
    { name: 'actorRole', type: 'text', admin: { readOnly: true } },
    { name: 'targetType', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'targetId', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'ipAddress', type: 'text', admin: { readOnly: true } },
    { name: 'userAgent', type: 'textarea', admin: { readOnly: true } },
    { name: 'metadata', type: 'json', admin: { readOnly: true } },
    { name: 'legalGround', type: 'text', admin: { readOnly: true } },
    { name: 'targetNorm', type: 'text', admin: { readOnly: true } },
    { name: 'targetEntity', type: 'text', admin: { readOnly: true } },
  ],
}

