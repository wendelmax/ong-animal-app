import { getPublicInvitationHttp } from '@/lib/volunteer-registration/http'

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  return getPublicInvitationHttp(request, (await params).token)
}

