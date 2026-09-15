import type { R2StoragePort } from '../storage/r2'

export async function cleanupOrphanedVolunteerFiles(payload: any, r2: R2StoragePort, now = new Date(), retentionHours = 24) {
  const cutoff = new Date(now.getTime() - retentionHours * 60 * 60 * 1000).toISOString()
  const result = await payload.find({ collection: 'volunteer-files', where: { uploadStatus: { in: ['PENDING', 'UPLOADED'] }, volunteer: { exists: false }, createdAt: { less_than: cutoff } }, limit: 100, overrideAccess: true })
  let deleted = 0
  let failed = 0
  for (const file of result.docs || []) {
    try {
      await r2.deleteObject(file.objectKey)
      await payload.update({ collection: 'volunteer-files', id: file.id, data: { uploadStatus: 'DELETED' }, overrideAccess: true })
      deleted += 1
    } catch {
      failed += 1
    }
  }
  return { deleted, failed }
}

