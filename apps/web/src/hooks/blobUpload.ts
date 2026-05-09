import { put, del } from '@vercel/blob'
import type { CollectionBeforeChangeHook, CollectionAfterDeleteHook } from 'payload'

/**
 * Hook que intercepta o upload de mídia e envia para o Vercel Blob Storage.
 * Usa @vercel/blob diretamente, sem @payloadcms/plugin-cloud-storage.
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

    // Usa o campo url nativo do Payload
    return {
      ...data,
      url: blob.url,
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
  const url = doc?.url
  if (!url || !url.includes('blob.vercel-storage.com')) return

  try {
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN })
  } catch (error) {
    console.error('[Blob Delete] Error:', error)
  }
}
