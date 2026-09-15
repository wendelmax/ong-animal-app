'use client'

import { FormEvent, useEffect, useState } from 'react'
import { VolunteerFileUpload } from './VolunteerFileUpload'

type PublicData = { submissionId: string; expiresAt: string; term: { id: string; version: string; content: string; contentHash: string } }

export function VolunteerRegistrationForm({ token }: { token: string }) {
  const [publicData, setPublicData] = useState<PublicData | null>(null)
  const [invalid, setInvalid] = useState(false)
  const [files, setFiles] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/volunteer-invitations/${token}/public`, { cache: 'no-store' }).then(async (response) => {
      if (!response.ok) { setInvalid(true); return }
      setPublicData(await response.json())
    }).catch(() => setInvalid(true))
  }, [token])

  if (invalid) return <section className="mx-auto max-w-2xl px-6 py-24 text-center"><h1 className="text-4xl font-black">Link inválido</h1><p className="mt-4 text-zinc-600">Este convite expirou, já foi utilizado ou não está mais disponível.</p></section>
  if (submitted) return <section className="mx-auto max-w-2xl px-6 py-24 text-center"><h1 className="text-4xl font-black text-brand-blue">Cadastro enviado!</h1><p className="mt-4 text-zinc-600">A equipe da Viralatinhas analisará seus dados e entrará em contato.</p></section>
  if (!publicData) return <section className="mx-auto max-w-2xl px-6 py-24 text-center"><p className="text-zinc-600">Carregando cadastro seguro…</p></section>

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError('')
    const form = new FormData(event.currentTarget)
    const statement = form.get('statement')
    if (statement !== 'on' || !files.PERSONAL_PHOTO || !files.IDENTITY_DOCUMENT) { setError('Aceite o termo e envie os dois arquivos obrigatórios.'); return }
    const response = await fetch(`/api/volunteer-invitations/${token}/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName: form.get('fullName'), cpf: form.get('cpf'), birthDate: form.get('birthDate'), rg: form.get('rg'), rgIssuer: form.get('rgIssuer'), phone: form.get('phone'), email: form.get('email'), addressStreet: form.get('addressStreet'), addressNeighborhood: form.get('addressNeighborhood'), addressCity: form.get('addressCity'), addressZipcode: form.get('addressZipcode'), activityArea: form.get('activityArea'), specificRole: form.get('specificRole'), admittedAt: new Date().toISOString(), avgHoursPerMonth: Number(form.get('avgHoursPerMonth') || 0), statement, termVersionId: publicData.term.id, termContentHash: publicData.term.contentHash, submissionId: publicData.submissionId }) })
    if (!response.ok) { const data = await response.json().catch(() => ({})); setError(data.error === 'CPF_ENCRYPTION_NOT_CONFIGURED' ? 'Cadastro temporariamente indisponível.' : 'Não foi possível enviar o cadastro. Confira os campos e tente novamente.'); return }
    setSubmitted(true)
  }

  return <section className="mx-auto max-w-3xl px-6 py-14"><div className="mb-10"><p className="font-bold uppercase tracking-widest text-brand-orange">Viralatinhas Sumaré</p><h1 className="mt-2 text-4xl font-black text-zinc-900">Cadastro de voluntário</h1><p className="mt-3 text-zinc-600">Preencha seus dados para entrar na nossa rede de proteção animal.</p></div><form onSubmit={submit} className="space-y-8">
    <div className="grid gap-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 md:grid-cols-2"><label className="md:col-span-2">Nome completo<input name="fullName" required className="form-input" /></label><label>CPF<input name="cpf" required inputMode="numeric" className="form-input" /></label><label>Data de nascimento<input name="birthDate" type="date" required className="form-input" /></label><label>RG<input name="rg" required className="form-input" /></label><label>Órgão emissor<input name="rgIssuer" className="form-input" /></label><label>WhatsApp<input name="phone" required className="form-input" /></label><label>E-mail<input name="email" type="email" className="form-input" /></label><label>Rua<input name="addressStreet" className="form-input" /></label><label>Bairro<input name="addressNeighborhood" className="form-input" /></label><label>Cidade<input name="addressCity" defaultValue="Sumaré" className="form-input" /></label><label>CEP<input name="addressZipcode" className="form-input" /></label><label>Área de atuação<input name="activityArea" required className="form-input" /></label><label>Função específica<input name="specificRole" required className="form-input" /></label><label>Horas médias por mês<input name="avgHoursPerMonth" type="number" min="0" step="0.5" className="form-input" /></label></div>
    <div className="grid gap-5 md:grid-cols-2"><VolunteerFileUpload label="Foto pessoal" purpose="PERSONAL_PHOTO" token={token} submissionId={publicData.submissionId} onUploaded={(id, purpose) => setFiles((current) => ({ ...current, [purpose]: id }))} /><VolunteerFileUpload label="Foto do documento" purpose="IDENTITY_DOCUMENT" token={token} submissionId={publicData.submissionId} onUploaded={(id, purpose) => setFiles((current) => ({ ...current, [purpose]: id }))} /></div>
    <article className="rounded-3xl bg-zinc-50 p-6 ring-1 ring-zinc-200"><h2 className="text-xl font-black">Termo de adesão — versão {publicData.term.version}</h2><div className="mt-4 max-h-72 overflow-y-auto whitespace-pre-wrap text-sm leading-7 text-zinc-700">{publicData.term.content}</div><label className="mt-6 flex gap-3 font-semibold text-zinc-800"><input name="statement" type="checkbox" required className="mt-1" />Li e concordo com os termos de adesão e tratamento de dados</label></article>
    {error && <p className="rounded-xl bg-red-50 p-4 font-semibold text-red-700">{error}</p>}<button type="submit" className="w-full rounded-2xl bg-brand-orange px-6 py-4 text-lg font-black text-white shadow-xl shadow-brand-orange/20">Enviar cadastro</button>
  </form></section>
}

