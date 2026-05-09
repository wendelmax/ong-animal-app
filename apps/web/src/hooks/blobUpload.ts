import { put, del } from '@vercel/blob'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

/**
 * Hook que roda DEPOIS do Payload processar o upload.
 * Envia o arquivo para o Vercel Blob e atualiza a URL no documento.
 */
export const uploadToBlob: CollectionAfterChangeHook = async ({ doc, req, operation }) => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return doc
  if (operation !== 'create' && operation !== 'update') return doc
  if (!req.file) return doc

  // Se já é uma URL do blob, não re-processa
  if (doc.url && doc.url.includes('blob.vercel-storage.com')) return doc

  const file = req.file
  const filename = `media/${Date.now()}-${file.name}`

  try {
    const blob = await put(filename, file.data, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: file.mimetype,
    })

    // Atualiza diretamente no banco com a URL do blob
    await req.payload.update({
      collection: 'media',
      id: doc.id,
      data: {
        url: blob.url,
      },
      overrideAccess: true,
    })

    return { ...doc, url: blob.url }
  } catch (error) {
    console.error('[Blob Upload] Error:', error)
    return doc
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
