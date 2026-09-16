import { createHash } from 'node:crypto'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { checkPublicRateLimit } from './rate-limit'
import {
  confirmUpload,
  createUploadIntent,
  getPublicInvitation,
  submitRegistration,
  VolunteerRegistrationError,
} from './service'

const ipFrom = (request: Request) =>
  request.headers.get('x-real-ip') ||
  request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim() ||
  'unknown'

const errorResponse = (error: unknown) => {
  const normalized =
    error instanceof VolunteerRegistrationError
      ? error
      : new VolunteerRegistrationError('INTERNAL_ERROR', 500)

  return Response.json({ error: normalized.code }, { status: normalized.status })
}

const withPublicRequest = async <T>(
  request: Request,
  token: string,
  operation: (context: {
    payload: any
    req: any
    ipAddress: string
    userAgent: string
  }) => Promise<T>,
) => {
  try {
    const tokenHash = createHash('sha256').update(token, 'utf8').digest('hex')
    const ipAddress = ipFrom(request)
    const [inviteResult, ipResult] = await Promise.all([
      checkPublicRateLimit({
        key: `invite:${tokenHash}:${ipAddress}`,
        limit: 30,
        windowSeconds: 3600,
      }),
      checkPublicRateLimit({ key: `ip:${ipAddress}`, limit: 120, windowSeconds: 3600 }),
    ])
    if (!inviteResult.success || !ipResult.success) {
      throw new VolunteerRegistrationError('RATE_LIMITED', 429)
    }

    const payload = await getPayload({ config })
    const req = Object.assign(request, { payload })
    const result = await operation({
      payload,
      req,
      ipAddress,
      userAgent: request.headers.get('user-agent') || 'unknown',
    })
    return Response.json(result)
  } catch (error) {
    return errorResponse(error)
  }
}

export const getPublicInvitationHttp = (request: Request, token: string) =>
  withPublicRequest(request, token, (context) => getPublicInvitation(context, token))

export const createUploadIntentHttp = async (request: Request, token: string) =>
  withPublicRequest(request, token, async (context) =>
    createUploadIntent(context, token, await request.json()),
  )

export const confirmUploadHttp = async (request: Request, token: string) =>
  withPublicRequest(request, token, async (context) =>
    confirmUpload(context, token, await request.json()),
  )

export const submitRegistrationHttp = async (request: Request, token: string) =>
  withPublicRequest(request, token, async (context) =>
    submitRegistration(context, token, await request.json()),
  )
