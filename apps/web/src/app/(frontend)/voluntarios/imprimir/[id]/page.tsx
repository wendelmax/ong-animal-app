import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { VolunteerPrintableTerm } from '@/components/VolunteerPrintableTerm'
import { canPrintVolunteerFullCpf, canPrintVolunteerTerm } from '@/lib/volunteer-registration/access'
import { decryptVolunteerCpf } from '@/lib/volunteer-registration/service'
import { renderVolunteerTerm } from '@/lib/volunteer-registration/term-template'

type PageProps = { params: Promise<{ id: string }>; searchParams?: Promise<{ fullCpf?: string }> }

const formatDate = (value: unknown) => value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: 'UTC' }).format(new Date(String(value))) : ''
const formatCpf = (value: string) => value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')

export default async function VolunteerPrintableTermPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const query = searchParams ? await searchParams : {}
  const payload = await getPayload({ config })
  const requestHeaders = await headers()
  const request = Object.assign(new Request('http://localhost/voluntarios/imprimir', { headers: new Headers(requestHeaders) }), { payload })
  const { user } = await payload.auth({ headers: request.headers, req: request as any })
  if (!user || !canPrintVolunteerTerm(user)) notFound()

  const volunteer = await payload.findByID({ collection: 'volunteers', id, depth: 0, overrideAccess: true, req: request as any }).catch(() => null)
  if (!volunteer) notFound()
  const acceptanceResult = await payload.find({ collection: 'volunteer-term-acceptances', where: { volunteer: { equals: id } }, sort: '-acceptedAt', limit: 1, depth: 1, overrideAccess: true, req: request as any })
  const acceptance = acceptanceResult.docs?.[0] as any
  const term = typeof acceptance?.termVersion === 'object' ? acceptance.termVersion : null
  const content = acceptance?.contentSnapshot || term?.content
  if (!acceptance || !content || !term) notFound()

  const fullCpfRequested = query.fullCpf === '1'
  const showFullCpf = fullCpfRequested && canPrintVolunteerFullCpf(user)
  const cpf = showFullCpf && volunteer.cpfEncrypted ? formatCpf(decryptVolunteerCpf(String(volunteer.cpfEncrypted))) : String(volunteer.cpfMasked || '')
  await payload.create({ collection: 'audit-events', data: { eventType: 'LGPD_SENSITIVE_DATA_ACCESS', occurredAt: new Date().toISOString(), actorType: 'ADMIN', actorId: String(user.id), actorRole: String(user.role), targetType: 'volunteers', targetId: String(id), ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined, userAgent: request.headers.get('user-agent') || 'server-rendered-print', metadata: { document: 'VOLUNTEER_TERM', fullCpf: showFullCpf }, legalGround: 'LEGITIMATE_ADMINISTRATIVE_ACCESS' }, overrideAccess: true, req: request as any })

  const renderedContent = renderVolunteerTerm(String(content), {
    term: { version: String(term.version), content_hash: String(acceptance.contentHashAtAcceptance) },
    volunteer: { full_name: String(volunteer.nome || ''), rg: String(volunteer.rg || ''), rg_issuer: String(volunteer.orgaoEmissor || ''), cpf_formatted: cpf, birth_date: formatDate(volunteer.dataNascimento), address_street: String(volunteer.enderecoRua || volunteer.endereco || ''), address_neighborhood: String(volunteer.enderecoBairro || ''), address_city: String(volunteer.cidade || ''), address_state: 'SP', address_zipcode: String(volunteer.cep || ''), phone: String(volunteer.whatsapp || ''), email: String(volunteer.email || '') },
    operational: { joined_at: formatDate(volunteer.dataIngresso), activity_area: String(volunteer.areaAtuacao || ''), specific_role: String(volunteer.funcaoEspecifica || volunteer.funcao || ''), avg_hours_per_month: String(volunteer.horasMediasMes || '') },
    acceptance: { formatted_date: formatDate(acceptance.acceptedAt) },
  })

  return <VolunteerPrintableTerm volunteer={{ fullName: String(volunteer.nome || ''), cpf }} acceptance={{ acceptedAt: String(acceptance.acceptedAt), ipAddress: String(acceptance.ipAddress), userAgent: String(acceptance.userAgent), statement: String(acceptance.statement) }} renderedContent={renderedContent} term={{ version: String(term.version), contentHash: String(acceptance.contentHashAtAcceptance) }} showFullCpf={showFullCpf} logoSrc="/logo.png" />
}
