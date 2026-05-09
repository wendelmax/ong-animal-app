'use client'

import React, { useState, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Heart, ArrowLeft, Send, CheckCircle2, Info } from 'lucide-react'
import Link from 'next/link'
import { submitAdoptionRequest } from '@/actions/adoption'

export default function AdoptionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const animalSlug = searchParams.get('pet')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    if (animalSlug) formData.append('animalSlug', animalSlug)

    const result = await submitAdoptionRequest(formData)

    if (result.success) {
      setIsSuccess(true)
      window.scrollTo(0, 0)
    } else {
      setError(result.error || 'Erro desconhecido')
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-zinc-50 pt-40 pb-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-5xl font-black text-zinc-900 mb-6 tracking-tighter">Pedido enviado com sucesso!</h1>
          <p className="text-xl text-zinc-600 font-medium mb-12 leading-relaxed">
            Nossa equipe de voluntários analisará seu pedido e entrará em contato via WhatsApp em breve para agendar uma entrevista.
          </p>
          <Link 
            href="/animais" 
            className="inline-flex items-center gap-3 px-12 py-5 bg-brand-blue text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all"
          >
            Voltar para os Animais
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-12">
          <Link 
            href={animalSlug ? `/animais/${animalSlug}` : '/animais'} 
            className="inline-flex items-center gap-2 text-zinc-500 font-bold hover:text-brand-blue transition-colors group mb-8"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Voltar
          </Link>
          <h1 className="text-5xl md:text-6xl font-black text-zinc-900 tracking-tighter">
            Formulário de <span className="text-brand-magenta">Interesse</span>
          </h1>
          <p className="text-xl text-zinc-500 font-medium mt-4">
            Preencha os dados abaixo para iniciar o processo de adoção {animalSlug ? `do ${animalSlug}` : ''}.
          </p>
        </div>

        <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-xl border border-zinc-100">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-zinc-400">Nome Completo</label>
                <input 
                  required
                  name="nome"
                  type="text" 
                  placeholder="Seu nome"
                  className="w-full px-6 py-4 bg-zinc-50 border-2 border-zinc-100 rounded-2xl focus:border-brand-blue focus:outline-none font-bold transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-zinc-400">WhatsApp / Telefone</label>
                <input 
                  required
                  name="telefone"
                  type="tel" 
                  placeholder="(19) 99999-9999"
                  className="w-full px-6 py-4 bg-zinc-50 border-2 border-zinc-100 rounded-2xl focus:border-brand-blue focus:outline-none font-bold transition-all"
                />
              </div>
            </div>

            {/* Address Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-zinc-400">Cidade</label>
                <input 
                  required
                  name="cidade"
                  type="text" 
                  defaultValue="Sumaré"
                  className="w-full px-6 py-4 bg-zinc-50 border-2 border-zinc-100 rounded-2xl focus:border-brand-blue focus:outline-none font-bold transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-zinc-400">Tipo de Residência</label>
                <select 
                  required
                  name="tipoResidencia"
                  className="w-full px-6 py-4 bg-zinc-50 border-2 border-zinc-100 rounded-2xl focus:border-brand-blue focus:outline-none font-bold transition-all appearance-none"
                >
                  <option value="Casa">Casa</option>
                  <option value="Apartamento">Apartamento</option>
                  <option value="Chácara/Sítio">Chácara/Sítio</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-widest text-zinc-400">Endereço Completo</label>
              <textarea 
                required
                name="endereco"
                rows={3}
                placeholder="Rua, número, bairro..."
                className="w-full px-6 py-4 bg-zinc-50 border-2 border-zinc-100 rounded-2xl focus:border-brand-blue focus:outline-none font-bold transition-all"
              />
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex items-center gap-4 p-6 bg-zinc-50 rounded-2xl border-2 border-zinc-100 cursor-pointer hover:border-brand-magenta transition-all group">
                <input name="possuiOutrosAnimais" type="checkbox" className="w-6 h-6 rounded-lg text-brand-magenta focus:ring-brand-magenta" />
                <span className="font-bold text-zinc-700 group-hover:text-brand-magenta transition-colors">Possui outros animais?</span>
              </label>
              <label className="flex items-center gap-4 p-6 bg-zinc-50 rounded-2xl border-2 border-zinc-100 cursor-pointer hover:border-brand-magenta transition-all group">
                <input name="possuiTelaProtecao" type="checkbox" className="w-6 h-6 rounded-lg text-brand-magenta focus:ring-brand-magenta" />
                <span className="font-bold text-zinc-700 group-hover:text-brand-magenta transition-colors">Possui telas de proteção?</span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-widest text-zinc-400">Observações Extras</label>
              <textarea 
                name="observacoes"
                rows={4}
                placeholder="Conte-nos um pouco sobre sua rotina e por que deseja adotar..."
                className="w-full px-6 py-4 bg-zinc-50 border-2 border-zinc-100 rounded-2xl focus:border-brand-blue focus:outline-none font-bold transition-all"
              />
            </div>

            {error && (
              <div className="p-6 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center gap-3">
                <Info className="w-6 h-6" /> {error}
              </div>
            )}

            <button 
              disabled={isSubmitting}
              type="submit"
              className="w-full py-6 bg-brand-orange text-white text-xl font-black rounded-[2rem] shadow-2xl shadow-brand-orange/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:scale-100"
            >
              {isSubmitting ? 'Enviando...' : (
                <>Enviar Pedido de Interesse <Send className="w-6 h-6" /></>
              )}
            </button>

            <p className="text-center text-zinc-400 font-medium text-sm">
              Ao enviar, você concorda com nossos termos de privacidade e proteção de dados.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
