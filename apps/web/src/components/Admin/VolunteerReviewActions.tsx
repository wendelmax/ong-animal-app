'use client'

import { useState } from 'react'

export function VolunteerReviewActions({ volunteerId }: { volunteerId: string }) {
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const review = async (decision: 'APPROVE' | 'REJECT') => {
    if (decision === 'REJECT' && !reason.trim()) { setMessage('Informe o motivo da rejeição.'); return }
    const response = await fetch(`/api/volunteers/${volunteerId}/review`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ decision, rejectionReason: reason }) })
    setMessage(response.ok ? 'Revisão salva.' : 'Não foi possível salvar a revisão.')
  }
  return <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => void review('APPROVE')} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white">Aprovar</button><input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Motivo se rejeitar" aria-label="Motivo da rejeição" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" /><button type="button" onClick={() => void review('REJECT')} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white">Rejeitar</button>{message && <span className="text-sm font-semibold">{message}</span>}</div>
}

