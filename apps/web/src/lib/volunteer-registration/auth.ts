import { getPayload } from 'payload'

import config from '../../payload.config'

export async function authenticatePayloadRequest(
  request: Request,
): Promise<{ payload: any; req: any; user: any }> {
  const payload = await getPayload({ config })
  const req = Object.assign(request, { payload })
  const { user } = await payload.auth({ headers: request.headers, req: req as any })

  return { payload, req, user }
}
