'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'

export async function submitAdoptionRequest(formData: FormData) {
  const payload = await getPayload({ config })

  const animalSlug = formData.get('animalSlug') as string
  const nome = formData.get('nome') as string
  const telefone = formData.get('telefone') as string
  const cidade = formData.get('cidade') as string
  const endereco = formData.get('endereco') as string
  const tipoResidencia = formData.get('tipoResidencia') as string
  const possuiOutrosAnimais = formData.get('possuiOutrosAnimais') === 'on'
  const possuiTelaProtecao = formData.get('possuiTelaProtecao') === 'on'
  const observacoes = formData.get('observacoes') as string

  // Find animal ID by slug
  const animalResult = await payload.find({
    collection: 'animals',
    where: {
      slug: {
        equals: animalSlug,
      },
    },
    limit: 1,
  })

  const animal = animalResult.docs[0]

  if (!animal) {
    throw new Error('Animal não encontrado')
  }

  try {
    await payload.create({
      collection: 'adoption-requests',
      data: {
        animal: animal.id,
        nome,
        telefone,
        cidade,
        endereco,
        tipoResidencia: tipoResidencia as any,
        possuiOutrosAnimais,
        possuiTelaProtecao,
        observacoes,
        status: 'Interessado',
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error creating adoption request:', error)
    return { success: false, error: 'Ocorreu um erro ao enviar seu pedido. Tente novamente.' }
  }
}
