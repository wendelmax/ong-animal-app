'use client'

import { useState } from 'react'

type Props = { label: string; purpose: 'PERSONAL_PHOTO' | 'IDENTITY_DOCUMENT'; token: string; submissionId: string; onUploaded: (fileId: string, purpose: Props['purpose']) => void }

const digest = async (file: File) => {
  const buffer = await file.arrayBuffer()
  const hash = await crypto.subtle.digest('SHA-256', buffer)
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function VolunteerFileUpload({ label, purpose, token, submissionId, onUploaded }: Props) {
  const [state, setState] = useState('Nenhum arquivo selecionado')

  const upload = async (file: File) => {
    setState('Validando e enviando…')
    const sha256 = await digest(file)
    const intentResponse = await fetch(`/api/volunteer-invitations/${token}/uploads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ submissionId, purpose, mimeType: file.type, sizeBytes: file.size, sha256 }) })
    if (!intentResponse.ok) { setState('Arquivo recusado. Confira formato e tamanho.'); return }
    const intent = await intentResponse.json()
    const uploadResponse = await fetch(intent.url, { method: 'PUT', headers: intent.headers || { 'Content-Type': file.type }, body: file })
    if (!uploadResponse.ok) { setState('Não foi possível enviar o arquivo.'); return }
    const confirmResponse = await fetch(`/api/volunteer-invitations/${token}/uploads/confirm`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileId: intent.fileId }) })
    if (!confirmResponse.ok) { setState('Não foi possível confirmar o arquivo.'); return }
    onUploaded(intent.fileId, purpose)
    setState(`${file.name} enviado com sucesso`)
  }

  return <label className="block rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-5 font-semibold text-zinc-700">
    <span className="mb-3 block">{label}</span>
    <input type="file" accept={purpose === 'PERSONAL_PHOTO' ? 'image/jpeg,image/png' : 'image/jpeg,image/png,application/pdf'} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file) }} className="block w-full text-sm" />
    <small className="mt-2 block text-zinc-500">{state}</small>
  </label>
}

