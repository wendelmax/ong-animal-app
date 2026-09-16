import { confirmUploadHttp } from '@/lib/volunteer-registration/http'

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  return confirmUploadHttp(request, (await params).token)
}

