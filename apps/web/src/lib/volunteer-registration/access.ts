type RoleUser = { role?: string | null } | null | undefined

const INVITATION_ROLES = new Set(['Admin', 'VOLUNTEER_MANAGER', 'COMPLIANCE_OFFICER', 'LEGAL_DIRECTOR'])
const FILE_ROLES = new Set(['Admin', 'COMPLIANCE_OFFICER', 'LEGAL_DIRECTOR'])
const PRIVATE_DATA_ROLES = new Set(['Admin', 'COMPLIANCE_OFFICER', 'LEGAL_DIRECTOR'])
const CPF_ROLES = new Set(['Admin', 'COMPLIANCE_OFFICER', 'LEGAL_DIRECTOR'])

const hasRole = (user: RoleUser, roles: Set<string>) => Boolean(user?.role && roles.has(user.role))

export const canManageVolunteerInvitations = (user: RoleUser) => hasRole(user, INVITATION_ROLES)
export const canReviewVolunteer = (user: RoleUser) => hasRole(user, INVITATION_ROLES)
export const canReadVolunteerContact = (user: RoleUser) => hasRole(user, INVITATION_ROLES)
export const canReadVolunteerPrivateData = (user: RoleUser) => hasRole(user, PRIVATE_DATA_ROLES)
export const canReadVolunteerCpf = (user: RoleUser) => hasRole(user, CPF_ROLES)
export const canUpdateVolunteerProtectedFields = (user: RoleUser) => hasRole(user, PRIVATE_DATA_ROLES)
export const canDownloadVolunteerFile = (user: RoleUser) => hasRole(user, FILE_ROLES)

