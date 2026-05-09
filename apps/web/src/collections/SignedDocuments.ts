import type { CollectionConfig } from 'payload'

export const SignedDocuments: CollectionConfig = {
  slug: 'signed-documents',
  labels: {
    singular: 'Documento Assinado',
    plural: 'Documentos Assinados',
  },
  admin: {
    useAsTitle: 'id',
    description: 'Registro de termos assinados (Adoção, Responsabilidade, etc)',
    group: 'Administração',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user?.role === 'Admin' || user?.role === 'Voluntário'),
    create: () => true, // Allows creation from frontend
    update: ({ req: { user } }) => Boolean(user?.role === 'Admin'),
    delete: ({ req: { user } }) => Boolean(user?.role === 'Admin'),
  },
  fields: [
    {
      name: 'template',
      type: 'relationship',
      relationTo: 'document-templates',
      required: true,
      label: 'Template Utilizado',
    },
    {
      name: 'adoptionRequest',
      type: 'relationship',
      relationTo: 'adoption-requests',
      label: 'Requisição de Adoção Relacionada',
    },
    {
      name: 'volunteer',
      type: 'relationship',
      relationTo: 'volunteers',
      label: 'Voluntário Relacionado',
    },
    {
      name: 'signedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      label: 'Data da Assinatura',
    },
    {
      name: 'signatureIp',
      type: 'text',
      label: 'IP da Assinatura',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      options: ['Assinado', 'Revogado'],
      defaultValue: 'Assinado',
      required: true,
    },
    {
      name: 'generatedPdf',
      type: 'upload',
      relationTo: 'media',
      label: 'PDF Gerado/Assinado',
    },
  ],
}
