'use client'

import { useState } from 'react'

export function VolunteerInvitationActions() {
  const [link, setLink] = useState('')
  const [message, setMessage] = useState('')
  const [exportYear, setExportYear] = useState(String(new Date().getFullYear()))
  const [includeCpf, setIncludeCpf] = useState(false)
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
  const exportReport = async () => {
    setMessage('Gerando relatório…')
    const response = await fetch(`/api/v1/compliance/cge/export-volunteers?year=${encodeURIComponent(exportYear)}&includeCpf=${includeCpf}`)
    if (!response.ok) { setMessage('Não foi possível gerar o relatório para este perfil.'); return }
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `voluntarios-cge-${exportYear}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
    setMessage('Relatório baixado.')
  }
  return <div className="mb-6 rounded-2xl border border-brand-blue/20 bg-brand-blue/5 p-5"><div className="flex flex-wrap items-center gap-4"><button type="button" onClick={() => void create()} className="rounded-xl bg-brand-blue px-4 py-3 font-bold text-white">Gerar link público</button><label className="flex items-center gap-2 text-sm font-semibold">Ano-base<input type="number" min="2000" max={new Date().getFullYear() + 1} value={exportYear} onChange={(event) => setExportYear(event.target.value)} className="w-24 rounded-lg border border-zinc-300 bg-white px-2 py-2" /></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={includeCpf} onChange={(event) => setIncludeCpf(event.target.checked)} />Incluir CPF completo (perfil autorizado)</label><button type="button" onClick={() => void exportReport()} className="rounded-xl border border-brand-blue px-4 py-3 font-bold text-brand-blue">Exportar relatório regulatório</button>{message && <span className="text-sm font-semibold text-zinc-700">{message}</span>}</div>{link && <input readOnly value={link} aria-label="Link público do convite" onFocus={(event) => event.currentTarget.select()} className="mt-4 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm" />}</div>
}

export default VolunteerInvitationActions

