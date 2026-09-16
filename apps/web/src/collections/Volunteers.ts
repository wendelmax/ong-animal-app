import type { CollectionConfig } from 'payload'
import { canReadVolunteerContact, canReadVolunteerCpf, canReadVolunteerPrivateData, canReviewVolunteer } from '../lib/volunteer-registration/access'

const noDirectUpdate = { update: () => false }
const privateRead = { read: ({ req: { user } }: any) => canReadVolunteerPrivateData(user) }
const cpfRead = { read: ({ req: { user } }: any) => canReadVolunteerCpf(user) }

export const Volunteers: CollectionConfig = {
  slug: 'volunteers',
  labels: {
    singular: 'Voluntário',
    plural: 'Voluntários',
  },
  admin: {
    useAsTitle: 'nome',
    description: 'Cadastro de voluntários da ONG',
    group: 'Pessoas',
    components: { beforeList: ['/components/Admin/VolunteerInvitationActions'], edit: { beforeDocumentControls: ['/components/Admin/VolunteerReviewActions'] } },
  },
  access: {
    read: ({ req: { user } }) => canReadVolunteerContact(user),
    create: ({ req: { user } }) => Boolean(user?.role === 'Admin'),
    update: ({ req: { user } }) => canReviewVolunteer(user),
    delete: ({ req: { user } }) => Boolean(user?.role === 'Admin'),
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      label: 'Status do cadastro',
      options: ['PENDING_REVIEW', 'ACTIVE', 'REJECTED', 'RESIGNED', 'SUSPENDED'],
      defaultValue: 'ACTIVE',
      required: true,
      access: noDirectUpdate,
    },
    {
      name: 'nome',
      type: 'text',
      required: true,
    },
    {
      name: 'whatsapp',
      type: 'text',
      label: 'WhatsApp',
      required: true,
    },
    {
      name: 'isLT',
      type: 'checkbox',
      label: 'Disponível para Lar Temporário (LT)?',
      defaultValue: false,
    },
    {
      name: 'capacidadeLT',
      type: 'number',
      label: 'Capacidade de Hospedagem (Animais)',
      admin: {
        condition: (data) => Boolean(data.isLT),
      },
    },
    {
      name: 'endereco',
      type: 'textarea',
      label: 'Endereço Completo',
      access: { ...privateRead, ...noDirectUpdate },
    },
    {
      name: 'cidade',
      type: 'text',
      label: 'Cidade',
      defaultValue: 'Sumaré',
      access: { ...privateRead, ...noDirectUpdate },
    },
    {
      name: 'funcao',
      type: 'select',
      label: 'Função Principal',
      options: ['Resgate', 'Lar Temporário', 'Transporte', 'Eventos', 'Administrativo', 'Marketing'],
      required: true,
    },
    {
      name: 'disponibilidade',
      type: 'text',
      label: 'Disponibilidade (Dias/Horários)',
    },
    {
      name: 'ativo',
      type: 'checkbox',
      label: 'Voluntário Ativo',
      defaultValue: true,
      access: noDirectUpdate,
    },
    { name: 'dataNascimento', type: 'date', label: 'Data de nascimento', access: { ...privateRead, ...noDirectUpdate }, admin: { date: { pickerAppearance: 'dayOnly' } } },
    { name: 'rg', type: 'text', label: 'RG', access: { ...privateRead, ...noDirectUpdate } },
    { name: 'orgaoEmissor', type: 'text', label: 'Órgão emissor', access: { ...privateRead, ...noDirectUpdate } },
    { name: 'cpfEncrypted', type: 'text', access: { ...cpfRead, ...noDirectUpdate }, admin: { hidden: true, readOnly: true } },
    { name: 'cpfBlindIndex', type: 'text', access: { ...cpfRead, ...noDirectUpdate }, admin: { hidden: true, readOnly: true } },
    { name: 'cpfMasked', type: 'text', label: 'CPF', access: noDirectUpdate, admin: { readOnly: true } },
    { name: 'email', type: 'email', label: 'E-mail' },
    { name: 'enderecoRua', type: 'text', label: 'Rua', access: { ...privateRead, ...noDirectUpdate } },
    { name: 'enderecoBairro', type: 'text', label: 'Bairro', access: { ...privateRead, ...noDirectUpdate } },
    { name: 'cep', type: 'text', label: 'CEP', access: { ...privateRead, ...noDirectUpdate } },
    { name: 'areaAtuacao', type: 'text', label: 'Área de atuação' },
    { name: 'funcaoEspecifica', type: 'text', label: 'Função específica' },
    { name: 'dataIngresso', type: 'date', label: 'Data de ingresso', access: noDirectUpdate },
    { name: 'horasMediasMes', type: 'number', label: 'Horas médias por mês', access: noDirectUpdate },
    { name: 'sourceInvitation', type: 'relationship', relationTo: 'volunteer-invitations', access: noDirectUpdate, admin: { readOnly: true } },
    {
      name: 'termAcceptances',
      type: 'join',
      label: 'Histórico de termos aceitos',
      collection: 'volunteer-term-acceptances',
      on: 'volunteer',
      access: { read: ({ req: { user } }: any) => user?.role === 'Admin' },
      admin: {
        defaultColumns: ['termVersion', 'acceptedAt', 'contentHashAtAcceptance'],
        description: 'Histórico somente leitura da versão do termo aceita pelo voluntário.',
      },
    },
    { name: 'submittedAt', type: 'date', access: noDirectUpdate, admin: { readOnly: true } },
    { name: 'reviewedAt', type: 'date', access: noDirectUpdate, admin: { readOnly: true } },
    { name: 'reviewedBy', type: 'relationship', relationTo: 'users', access: noDirectUpdate, admin: { readOnly: true } },
    { name: 'rejectionReason', type: 'textarea', access: noDirectUpdate, admin: { readOnly: true } },
  ],
}
