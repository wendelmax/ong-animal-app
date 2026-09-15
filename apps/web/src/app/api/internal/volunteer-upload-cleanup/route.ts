import { getPayload } from 'payload'
import config from '@payload-config'
import { r2Storage } from '@/lib/storage/r2'
import { cleanupOrphanedVolunteerFiles } from '@/lib/volunteer-registration/cleanup'

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET
  const received = request.headers.get('authorization')
  if (!expected || received !== `Bearer ${expected}`) return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  const payload = await getPayload({ config })
  return Response.json(await cleanupOrphanedVolunteerFiles(payload, r2Storage))
}

