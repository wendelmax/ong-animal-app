import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/components/VolunteerFileUpload', () => ({
  VolunteerFileUpload: ({ purpose, onUploaded }: any) => React.createElement(
    'button',
    { type: 'button', onClick: () => onUploaded(`${purpose}-id`, purpose) },
    purpose,
  ),
}))

describe('volunteer registration form', () => {
  it('sends the declaratory acceptance statement required by the backend', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        submissionId: 'submission-12345678901234567890',
        expiresAt: '2026-10-16T00:00:00.000Z',
        term: { id: 'term-1', version: '2026.1', content: 'Termo', contentHash: 'a'.repeat(64) },
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const { VolunteerRegistrationForm } = await import('@/components/VolunteerRegistrationForm')
    render(React.createElement(VolunteerRegistrationForm, { token: 'token-123' }))
    await screen.findByText('Termo')

    fireEvent.click(screen.getByRole('button', { name: 'PERSONAL_PHOTO' }))
    fireEvent.click(screen.getByRole('button', { name: 'IDENTITY_DOCUMENT' }))
    fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'Maria da Silva' } })
    fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '123.456.789-09' } })
    fireEvent.change(screen.getByLabelText('Data de nascimento'), { target: { value: '1990-01-02' } })
    fireEvent.change(screen.getByLabelText('RG'), { target: { value: '12.345.678-9' } })
    fireEvent.change(screen.getByLabelText('WhatsApp'), { target: { value: '(19) 99999-0000' } })
    fireEvent.change(screen.getByLabelText('Área de atuação'), { target: { value: 'Bem-Estar Animal' } })
    fireEvent.change(screen.getByLabelText('Função específica'), { target: { value: 'Cuidados de canil' } })
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.submit(screen.getByRole('button', { name: 'Enviar cadastro' }).closest('form')!)

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    const request = fetchMock.mock.calls[1][1]
    expect(JSON.parse(request.body).statement).toBe('Li e concordo com os termos de adesão e tratamento de dados')
  })
})
