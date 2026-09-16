import { createUploadIntentHttp } from '@/lib/volunteer-registration/http'

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  return createUploadIntentHttp(request, (await params).token)
}
