import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export type R2StoragePort = {
  createUploadUrl(input: { objectKey: string; contentType: string; maxSizeBytes: number }): Promise<{ url: string; expiresAt: string }>
  headObject(objectKey: string): Promise<{ exists: boolean; sizeBytes?: number; contentType?: string; etag?: string }>
  createDownloadUrl(objectKey: string): Promise<{ url: string; expiresAt: string }>
  deleteObject(objectKey: string): Promise<void>
}

const uploadExpirySeconds = 15 * 60
const downloadExpirySeconds = 5 * 60

const getClient = () => {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  if (!accountId || !accessKeyId || !secretAccessKey) throw new Error('R2_NOT_CONFIGURED')
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  })
}

const bucket = () => process.env.R2_BUCKET_NAME || (() => { throw new Error('R2_NOT_CONFIGURED') })()
const expiresAt = (seconds: number) => new Date(Date.now() + seconds * 1000).toISOString()

export const r2Storage: R2StoragePort = {
  async createUploadUrl({ objectKey, contentType }) {
    const expiry = expiresAt(uploadExpirySeconds)
    const command = new PutObjectCommand({ Bucket: bucket(), Key: objectKey, ContentType: contentType })
    return { url: await getSignedUrl(getClient(), command, { expiresIn: uploadExpirySeconds }), expiresAt: expiry }
  },
  async headObject(objectKey) {
    try {
      const result = await getClient().send(new HeadObjectCommand({ Bucket: bucket(), Key: objectKey }))
      return { exists: true, sizeBytes: result.ContentLength, contentType: result.ContentType, etag: result.ETag }
    } catch (error: any) {
      if (error?.$metadata?.httpStatusCode === 404 || error?.name === 'NotFound') return { exists: false }
      throw error
    }
  },
  async createDownloadUrl(objectKey) {
    const expiry = expiresAt(downloadExpirySeconds)
    const command = new GetObjectCommand({ Bucket: bucket(), Key: objectKey, ResponseContentDisposition: 'attachment' })
    return { url: await getSignedUrl(getClient(), command, { expiresIn: downloadExpirySeconds }), expiresAt: expiry }
  },
  async deleteObject(objectKey) {
    await getClient().send(new DeleteObjectCommand({ Bucket: bucket(), Key: objectKey }))
  },
}

