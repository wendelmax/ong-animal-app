import { put, del } from '@vercel/blob'

/**
 * Adaptador customizado para Vercel Blob que não depende do plugin cloud-storage.
 * Isso evita o crash de hidratação no Admin do Payload 3.0.
 */
export const vercelBlobAdapter = () => {
  return {
    name: 'vercel-blob',
    generateURL: ({ filename, prefix }: { filename: string; prefix?: string }) => {
      // Esta URL será atualizada após o upload real, 
      // mas precisamos retornar algo aqui ou deixar o Payload gerenciar.
      // No nosso caso, o handleUpload vai salvar a URL real no banco se possível.
      return filename
    },
    handleUpload: async ({ file, filename, prefix }: any) => {
      const blob = await put(filename, file.data, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
        contentType: file.mimetype,
      })
      
      // Retornamos os dados que o Payload vai salvar no banco
      return {
        url: blob.url,
        filename: filename,
      }
    },
    handleDelete: async ({ filename }: any) => {
      // Para deletar, precisaríamos da URL completa ou um mapeamento.
      // Por simplicidade, podemos ignorar ou buscar a URL.
    },
  }
}
