export type TermRenderContext = {
  term: {
    version: string
    content_hash: string
  }
  volunteer: {
    full_name: string
    rg: string
    rg_issuer: string
    cpf_formatted: string
    birth_date: string
    address_street: string
    address_neighborhood: string
    address_city: string
    address_state: string
    address_zipcode: string
    phone: string
    email: string
  }
  operational: {
    joined_at: string
    activity_area: string
    specific_role: string
    avg_hours_per_month: string
  }
  acceptance: {
    formatted_date: string
  }
}

type ContextPath = keyof TermRenderContext | `${keyof TermRenderContext}.${string}`

const allowedPaths = [
  'term.version',
  'term.content_hash',
  'volunteer.full_name',
  'volunteer.rg',
  'volunteer.rg_issuer',
  'volunteer.cpf_formatted',
  'volunteer.birth_date',
  'volunteer.address_street',
  'volunteer.address_neighborhood',
  'volunteer.address_city',
  'volunteer.address_state',
  'volunteer.address_zipcode',
  'volunteer.phone',
  'volunteer.email',
  'operational.joined_at',
  'operational.activity_area',
  'operational.specific_role',
  'operational.avg_hours_per_month',
  'acceptance.formatted_date',
] as const satisfies readonly ContextPath[]

const allowedPathSet = new Set<string>(allowedPaths)
const placeholderPattern = /{{\s*([^{}]+?)\s*}}/g

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;')

const getValue = (context: TermRenderContext, path: string) => {
  const [group, field] = path.split('.') as [keyof TermRenderContext, string]
  return String((context[group] as Record<string, unknown>)[field] ?? '')
}

export function validateVolunteerTermTemplate(template: string): { valid: true } | { valid: false; unknownTags: string[] } {
  const unknownTags = new Set<string>()
  for (const match of template.matchAll(placeholderPattern)) {
    const path = match[1].trim()
    if (!allowedPathSet.has(path)) unknownTags.add(path)
  }
  return unknownTags.size === 0 ? { valid: true } : { valid: false, unknownTags: [...unknownTags] }
}

export function renderVolunteerTerm(template: string, context: TermRenderContext): string {
  const validation = validateVolunteerTermTemplate(template)
  if (!validation.valid) throw new Error(`UNKNOWN_TERM_PLACEHOLDER:${validation.unknownTags.join(',')}`)
  return template.replace(placeholderPattern, (_match, rawPath: string) => escapeHtml(getValue(context, rawPath.trim())))
}
