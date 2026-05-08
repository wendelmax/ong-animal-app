import Link from 'next/link'
import React from 'react'
import './styles.css'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8 text-center">
        <div>
          <h1 className="text-5xl font-extrabold text-zinc-900 tracking-tight sm:text-6xl mb-6">
            Plataforma <span className="text-primary">ONG Animal</span>
          </h1>
          <p className="mt-4 text-xl text-zinc-600 max-w-2xl mx-auto">
            A solução completa para gestão de animais, adoções, voluntariado e financeiro.
            Tudo em um único lugar.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10">
          <Link
            href="/animais"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-primary hover:bg-orange-600 shadow-md transition-all hover:scale-105"
          >
            🐶 Ver Animais para Adoção
          </Link>
          <a
            href="/admin"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border-2 border-zinc-200 text-lg font-medium rounded-xl text-zinc-700 bg-white hover:bg-zinc-50 hover:border-zinc-300 shadow-sm transition-all"
          >
            ⚙️ Acessar Painel Admin
          </a>
        </div>
      </div>
    </div>
  )
}
