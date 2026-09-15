'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'

export async function submitAdoptionRequest(formData: FormData) {
  try {
    const payload = await getPayload({ config })

    const animalSlug = (formData.get('animalSlug') as string)?.trim()
    const nome = (formData.get('nome') as string)?.trim()
    const telefone = (formData.get('telefone') as string)?.trim()
    const cidade = (formData.get('cidade') as string)?.trim() || 'Sumaré'
    const endereco = (formData.get('endereco') as string)?.trim()
    const tipoResidencia = (formData.get('tipoResidencia') as string)?.trim() || 'Casa'
    const possuiOutrosAnimais = formData.get('possuiOutrosAnimais') === 'on'
    const possuiTelaProtecao = formData.get('possuiTelaProtecao') === 'on'
    const observacoes = (formData.get('observacoes') as string)?.trim() || ''

    if (!nome || !telefone) {
      return { success: false, error: 'Nome e telefone são obrigatórios.' }
    }

    if (!animalSlug) {
      return {
        success: false,
        error: 'Nenhum animal foi selecionado. Por favor, escolha um pet na página de animais.',
      }
    }

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
      return {
        success: false,
        error: 'O animal informado não foi encontrado ou já foi adotado.',
      }
    }

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
    return {
      success: false,
      error: 'Ocorreu um erro ao enviar seu pedido. Por favor, tente novamente ou entre em contato pelo WhatsApp.',
    }
  }
}
