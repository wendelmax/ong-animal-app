type RoleUser = { role?: string | null } | null | undefined

const INVITATION_ROLES = new Set(['Admin', 'VOLUNTEER_MANAGER', 'COMPLIANCE_OFFICER', 'LEGAL_DIRECTOR'])
const FILE_ROLES = new Set(['Admin', 'COMPLIANCE_OFFICER', 'LEGAL_DIRECTOR'])

const hasRole = (user: RoleUser, roles: Set<string>) => Boolean(user?.role && roles.has(user.role))

export const canManageVolunteerInvitations = (user: RoleUser) => hasRole(user, INVITATION_ROLES)
export const canReviewVolunteer = (user: RoleUser) => hasRole(user, INVITATION_ROLES)
export const canReadVolunteerContact = (user: RoleUser) => hasRole(user, INVITATION_ROLES)
export const canDownloadVolunteerFile = (user: RoleUser) => hasRole(user, FILE_ROLES)

