import type { Endpoint } from 'payload'
import { createHash } from 'node:crypto'
import { checkPublicRateLimit } from '../lib/volunteer-registration/rate-limit'
import { createFileDownload, createInvitation, createUploadIntent, confirmUpload, getPublicInvitation, reviewVolunteer, submitRegistration, VolunteerRegistrationError } from '../lib/volunteer-registration/service'

export const ipFrom = (req: any) => req.ip || req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim() || 'unknown'
const publicContext = (req: any) => ({ payload: req.payload, req, ipAddress: ipFrom(req), userAgent: req.headers.get('user-agent') || 'unknown' })
const body = async (req: any) => await req.json()
const respond = (fn: (req: any) => Promise<unknown>) => async (req: any) => {
  try { return Response.json(await fn(req)) }
  catch (error) { const e = error instanceof VolunteerRegistrationError ? error : new VolunteerRegistrationError('INTERNAL_ERROR', 500); return Response.json({ error: e.code }, { status: e.status }) }
}
const rateLimit = async (req: any, token: string) => {
  const ip = ipFrom(req)
  const tokenHash = createHash('sha256').update(token, 'utf8').digest('hex')
  const [inviteResult, ipResult] = await Promise.all([
    checkPublicRateLimit({ key: `invite:${tokenHash}:${ip}`, limit: 30, windowSeconds: 3600 }),
    checkPublicRateLimit({ key: `ip:${ip}`, limit: 120, windowSeconds: 3600 }),
  ])
  if (!inviteResult.success || !ipResult.success) throw new VolunteerRegistrationError('RATE_LIMITED', 429)
}

export const volunteerRegistrationEndpoints: Endpoint[] = [
  { path: '/volunteer-invitations', method: 'post', handler: respond(async (req: any) => createInvitation({ payload: req.payload, req, user: req.user }, await body(req))) },
  { path: '/volunteer-invitations/:token/public', method: 'get', handler: async (req: any) => { try { await rateLimit(req, req.routeParams.token); return Response.json(await getPublicInvitation(publicContext(req), req.routeParams.token)) } catch (error) { const e = error instanceof VolunteerRegistrationError ? error : new VolunteerRegistrationError('INTERNAL_ERROR', 500); return Response.json({ error: e.code }, { status: e.status }) } } },
  { path: '/volunteer-invitations/:token/uploads', method: 'post', handler: async (req: any) => { try { await rateLimit(req, req.routeParams.token); return Response.json(await createUploadIntent(publicContext(req), req.routeParams.token, await body(req))) } catch (error) { const e = error instanceof VolunteerRegistrationError ? error : new VolunteerRegistrationError('INTERNAL_ERROR', 500); return Response.json({ error: e.code }, { status: e.status }) } } },
  { path: '/volunteer-invitations/:token/uploads/confirm', method: 'post', handler: async (req: any) => { try { await rateLimit(req, req.routeParams.token); return Response.json(await confirmUpload(publicContext(req), req.routeParams.token, await body(req))) } catch (error) { const e = error instanceof VolunteerRegistrationError ? error : new VolunteerRegistrationError('INTERNAL_ERROR', 500); return Response.json({ error: e.code }, { status: e.status }) } } },
  { path: '/volunteer-invitations/:token/submit', method: 'post', handler: async (req: any) => { try { await rateLimit(req, req.routeParams.token); return Response.json(await submitRegistration(publicContext(req), req.routeParams.token, await body(req))) } catch (error) { const e = error instanceof VolunteerRegistrationError ? error : new VolunteerRegistrationError('INTERNAL_ERROR', 500); return Response.json({ error: e.code }, { status: e.status }) } } },
  { path: '/volunteers/:id/review', method: 'post', handler: respond(async (req: any) => reviewVolunteer({ payload: req.payload, req, user: req.user }, req.routeParams.id, await body(req))) },
  { path: '/volunteers/:id/files/:fileId/download', method: 'get', handler: respond(async (req: any) => createFileDownload({ payload: req.payload, req, user: req.user }, req.routeParams.id, req.routeParams.fileId)) },
]
