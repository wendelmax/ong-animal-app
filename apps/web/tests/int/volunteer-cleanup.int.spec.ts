import { describe, expect, it, vi } from 'vitest'
import { cleanupOrphanedVolunteerFiles } from '@/lib/volunteer-registration/cleanup'

describe('volunteer upload cleanup', () => {
  it('removes only old orphaned uploaded files and returns aggregate counts', async () => {
    const payload = { find: vi.fn().mockResolvedValue({ docs: [{ id: 'file-1', objectKey: 'volunteer-intake/a/b/personal-photo.jpg' }] }), update: vi.fn() }
    const r2 = { deleteObject: vi.fn().mockResolvedValue(undefined) } as any
    await expect(cleanupOrphanedVolunteerFiles(payload, r2, new Date('2026-09-15T12:00:00.000Z'))).resolves.toEqual({ deleted: 1, failed: 0 })
    expect(r2.deleteObject).toHaveBeenCalledWith('volunteer-intake/a/b/personal-photo.jpg')
    expect(payload.update).toHaveBeenCalledWith(expect.objectContaining({ id: 'file-1', data: { uploadStatus: 'DELETED' } }))
  })
})
