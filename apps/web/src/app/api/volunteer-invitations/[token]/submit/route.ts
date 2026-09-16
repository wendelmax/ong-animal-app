import { submitRegistrationHttp } from '@/lib/volunteer-registration/http'

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  return submitRegistrationHttp(request, (await params).token)
}

