import { createInvitationHttp } from '@/lib/volunteer-registration/http'

export const POST = (request: Request) => createInvitationHttp(request)
