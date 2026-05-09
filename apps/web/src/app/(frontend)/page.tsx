import Link from 'next/link'
import React from 'react'
import './styles.css'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-blue/5 via-brand-magenta/5 to-brand-orange/5 -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-brand-magenta/10 text-brand-magenta text-sm font-bold mb-8">
            🐾 Viralatinhas Sumaré: Amor em Movimento
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tight mb-8">
            Ajudando a escrever <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-magenta to-brand-orange">
              finais felizes.
            </span>
          </h1>
          
          <p className="mt-4 text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed mb-12">
            Somos uma ONG independente dedicada ao resgate, cuidado e adoção de animais em Sumaré. 
            Junte-se a nós para transformar a vida de um vira-lata.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <Link
              href="/animais"
              className="w-full sm:w-auto px-10 py-5 bg-brand-orange text-white text-xl font-bold rounded-2xl shadow-xl shadow-brand-orange/20 hover:scale-105 transition-all"
            >
              Quero Adotar 🐶
            </Link>
            <Link
              href="/como-ajudar"
              className="w-full sm:w-auto px-10 py-5 bg-white border-2 border-brand-blue text-brand-blue text-xl font-bold rounded-2xl hover:bg-brand-blue/5 transition-all"
            >
              Como Ajudar 🤝
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats or Features could go here */}
    </div>
  )
}
