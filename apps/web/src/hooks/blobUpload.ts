import { put, del } from '@vercel/blob'
import type { CollectionBeforeChangeHook, CollectionAfterDeleteHook } from 'payload'

/**
 * Hook que intercepta o upload de mídia e envia para o Vercel Blob Storage.
 * Isso substitui o @payloadcms/storage-vercel-blob que causa crash de hidratação.
 */
export const uploadToBlob: CollectionBeforeChangeHook = async ({ data, req }) => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return data
  if (!req.file) return data

  const file = req.file
  const filename = `media/${Date.now()}-${file.name}`

  try {
    const blob = await put(filename, file.data, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: file.mimetype,
    })

    // Salva a URL do blob no documento
    return {
      ...data,
      url: blob.url,
      blobUrl: blob.url,
      filename: file.name,
      mimeType: file.mimetype,
      filesize: file.size,
    }
  } catch (error) {
    console.error('[Blob Upload] Error:', error)
    return data
  }
}

/**
 * Hook para deletar o arquivo do Blob quando o documento é removido.
 */
export const deleteFromBlob: CollectionAfterDeleteHook = async ({ doc }) => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return
  if (!doc?.blobUrl) return

  try {
    await del(doc.blobUrl, { token: process.env.BLOB_READ_WRITE_TOKEN })
  } catch (error) {
    console.error('[Blob Delete] Error:', error)
  }
}
