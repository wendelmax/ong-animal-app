import Link from 'next/link'
import React from 'react'
import './styles.css'
import { Heart, ShieldCheck, Zap, Info, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Viralatinhas Sumaré | Proteção e Bem-Estar Animal',
  description: 'ONG independente dedicada ao controle populacional e promoção da adoção responsável em Sumaré.',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-brand-magenta/10 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-zinc-100 text-zinc-500 text-xs font-bold mb-8 uppercase tracking-[0.2em] border border-zinc-200">
            Associação Viralatinhas de Sumaré • Desde 2002
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-zinc-900 tracking-tighter mb-8 leading-[0.9]">
            Ajudando a escrever <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-magenta to-brand-orange">
              finais felizes.
            </span>
          </h1>
          
          <p className="mt-8 text-xl md:text-2xl text-zinc-600 max-w-3xl mx-auto leading-relaxed mb-12 font-medium">
            Atuamos na proteção e bem-estar de cães e gatos em Sumaré, focando no controle populacional e na promoção da adoção responsável.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <Link
              href="/animais"
              className="w-full sm:w-auto px-12 py-6 bg-brand-orange text-white text-xl font-black rounded-2xl shadow-2xl shadow-brand-orange/40 hover:scale-105 transition-all flex items-center justify-center gap-3"
            >
              Quero Adotar <ArrowRight className="w-6 h-6" />
            </Link>
            <Link
              href="/como-ajudar"
              className="w-full sm:w-auto px-12 py-6 bg-white border-4 border-brand-blue text-brand-blue text-xl font-black rounded-2xl hover:bg-brand-blue hover:text-white transition-all shadow-xl"
            >
              Como Ajudar 🤝
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-zinc-50 border-y border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-zinc-900 mb-4">O que fazemos por eles</h2>
            <p className="text-zinc-500 font-medium">Nossos pilares de atuação na cidade de Sumaré</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-zinc-100 hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue mb-8 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 mb-4">Castração</h3>
              <p className="text-zinc-600 leading-relaxed">Campanhas regulares a preços reduzidos para controle populacional e prevenção de doenças.</p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-sm border border-zinc-100 hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-brand-magenta/10 rounded-2xl flex items-center justify-center text-brand-magenta mb-8 group-hover:scale-110 transition-transform">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 mb-4">Adoção</h3>
              <p className="text-zinc-600 leading-relaxed">Intermediação cuidadosa entre animais resgatados e famílias amorosas que buscam um novo amigo.</p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-sm border border-zinc-100 hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange mb-8 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 mb-4">Educação</h3>
              <p className="text-zinc-600 leading-relaxed">Conscientização sobre posse responsável, direitos dos animais e combate total aos maus-tratos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Warning Disclaimer Section */}
      <section className="py-20 bg-brand-blue text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-bold mb-6">
              <Info className="w-4 h-4" /> Importante saber
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Não possuímos abrigo nem recolhemos animais.</h2>
            <p className="text-xl text-brand-blue-100 opacity-90 leading-relaxed">
              Nosso trabalho é focado na gestão de castrações, apoio à comunidade e intermediação de adoções. 
              Dependemos da rede de voluntários e lares temporários.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link 
              href="/quem-somos"
              className="px-8 py-4 bg-white text-brand-blue font-black rounded-xl hover:bg-brand-orange hover:text-white transition-all shadow-xl"
            >
              Conhecer nossa história
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
