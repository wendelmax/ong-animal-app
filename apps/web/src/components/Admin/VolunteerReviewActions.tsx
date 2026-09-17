'use client'

import { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

export function VolunteerReviewActions({ volunteerId: explicitVolunteerId }: { volunteerId?: string } = {}) {
  const { id } = useDocumentInfo()
  const volunteerId = explicitVolunteerId || (id ? String(id) : '')
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const review = async (decision: 'APPROVE' | 'REJECT') => {
    if (!volunteerId) return
    if (decision === 'REJECT' && !reason.trim()) { setMessage('Informe o motivo da rejeição.'); return }
    const response = await fetch(`/api/volunteers/${volunteerId}/review`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ decision, rejectionReason: reason }) })
    setMessage(response.ok ? 'Revisão salva.' : 'Não foi possível salvar a revisão.')
  }
  return <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => void review('APPROVE')} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white">Aprovar</button><input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Motivo se rejeitar" aria-label="Motivo da rejeição" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" /><button type="button" onClick={() => void review('REJECT')} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white">Rejeitar</button>{volunteerId && <a href={`/voluntarios/imprimir/${encodeURIComponent(volunteerId)}`} target="_blank" rel="noreferrer" className="rounded-lg border border-zinc-400 px-3 py-2 text-sm font-bold text-zinc-800">Imprimir termo</a>}{message && <span className="text-sm font-semibold">{message}</span>}</div>
}

