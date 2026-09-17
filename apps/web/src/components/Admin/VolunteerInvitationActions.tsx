'use client'

import { useState } from 'react'

export function VolunteerInvitationActions() {
  const [link, setLink] = useState('')
  const [message, setMessage] = useState('')
  const create = async () => {
    setMessage('Gerando…')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const response = await fetch('/api/volunteer-invitations/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ expiresAt, maxUses: 1 }) })
    if (!response.ok) { setMessage('Não foi possível gerar o convite.'); return }
    const data = await response.json()
    setLink(data.url)
    await navigator.clipboard?.writeText(data.url)
    setMessage('Link gerado e copiado.')
  }
  return <div className="mb-6 rounded-2xl border border-brand-blue/20 bg-brand-blue/5 p-5"><div className="flex flex-wrap items-center gap-4"><button type="button" onClick={() => void create()} className="rounded-xl bg-brand-blue px-4 py-3 font-bold text-white">Gerar link público</button>{message && <span className="text-sm font-semibold text-zinc-700">{message}</span>}</div>{link && <input readOnly value={link} aria-label="Link público do convite" onFocus={(event) => event.currentTarget.select()} className="mt-4 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm" />}</div>
}

