import { put } from '@vercel/blob'
import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Hook que intercepta o upload e envia para o Vercel Blob.
 * Salva a URL diretamente no campo 'url' nativo do Payload.
 */
export const uploadToBlob: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return data
  if (operation !== 'create' && operation !== 'update') return data
  if (!req.file) return data

  // Se já é uma URL do blob, não faz nada
  if (data.url && data.url.includes('blob.vercel-storage.com')) return data

  const file = req.file
  const filename = `media/${Date.now()}-${file.name}`

  try {
    const blob = await put(filename, file.data, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: file.mimetype,
    })

    // Sobrescrevemos os campos nativos do Payload
    return {
      ...data,
      url: blob.url,
      filename: file.name,
      filesize: file.size,
      mimeType: file.mimetype,
    }
  } catch (error) {
    console.error('[Blob Upload] Error:', error)
    return data
  }
}
