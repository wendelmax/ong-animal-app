import { authenticatePayloadRequest } from '@/lib/volunteer-registration/auth'
import { canReadVolunteerCpf, canReviewVolunteer } from '@/lib/volunteer-registration/access'
import { buildVolunteerCgeCsv, type VolunteerComplianceRow } from '@/lib/volunteer-registration/compliance-export'
import { decryptVolunteerCpf, VolunteerRegistrationError } from '@/lib/volunteer-registration/service'

const formatDate = (value: unknown) => value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: 'UTC' }).format(new Date(String(value))) : ''

const errorResponse = (error: unknown) => {
  const normalized = error instanceof VolunteerRegistrationError ? error : new VolunteerRegistrationError('INTERNAL_ERROR', 500)
  return Response.json({ error: normalized.code }, { status: normalized.status })
}

export async function GET(request: Request) {
  try {
    const { payload, req, user } = await authenticatePayloadRequest(request)
    if (!user) throw new VolunteerRegistrationError('UNAUTHORIZED', 401)
    if (!canReviewVolunteer(user)) throw new VolunteerRegistrationError('FORBIDDEN', 403)
    const url = new URL(request.url)
    const rawYear = url.searchParams.get('year') || ''
    const year = Number(rawYear)
    const currentYear = new Date().getUTCFullYear()
    if (!/^\d{4}$/.test(rawYear) || !Number.isInteger(year) || year < 2000 || year > currentYear + 1) throw new VolunteerRegistrationError('INVALID_YEAR')
    const includeCpf = url.searchParams.get('includeCpf') === 'true'
    if (includeCpf && !canReadVolunteerCpf(user)) throw new VolunteerRegistrationError('FORBIDDEN', 403)

    const result = await payload.find({
      collection: 'volunteers',
      where: {
        and: [
          { status: { not_equals: 'REJECTED' } },
          { dataIngresso: { less_than_equal: `${year}-12-31T23:59:59.999Z` } },
          { or: [{ dataDesligamento: { exists: false } }, { dataDesligamento: { greater_than_equal: `${year}-01-01T00:00:00.000Z` } }] },
        ],
      },
      depth: 0,
      limit: 1000,
      overrideAccess: true,
      req,
    })
    const rows: VolunteerComplianceRow[] = result.docs.map((volunteer: any) => ({
      fullName: String(volunteer.nome || ''),
      cpfFormatted: includeCpf && volunteer.cpfEncrypted ? formatCpf(decryptVolunteerCpf(String(volunteer.cpfEncrypted))) : String(volunteer.cpfMasked || ''),
      activityArea: String(volunteer.areaAtuacao || ''),
      specificRole: String(volunteer.funcaoEspecifica || volunteer.funcao || ''),
      joinedAt: formatDate(volunteer.dataIngresso),
      resignedAt: formatDate(volunteer.dataDesligamento),
      avgHoursPerMonth: String(volunteer.horasMediasMes ?? ''),
      status: String(volunteer.status || ''),
    }))
    const { csv, recordsCount } = buildVolunteerCgeCsv(rows, { includeCpf })
    await payload.create({ collection: 'audit-events', data: { eventType: 'LGPD_SENSITIVE_DATA_EXPORT', occurredAt: new Date().toISOString(), actorType: 'ADMIN', actorId: String(user.id), actorRole: String(user.role), targetType: 'volunteers', targetId: 'CGE_SP_CEE', metadata: { year, recordsCount, includeCpf }, legalGround: 'LEGAL_OBLIGATION_ART_7_II_LGPD', targetNorm: 'RESOLUCAO_CGE_15_2026_ANEXO_II_D', targetEntity: 'CGE_SP_CEE' }, overrideAccess: true, req })
    return new Response(csv, { status: 200, headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="voluntarios-cge-${year}.csv"`, 'Cache-Control': 'no-store' } })
  } catch (error) {
    return errorResponse(error)
  }
}

const formatCpf = (value: string) => value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
