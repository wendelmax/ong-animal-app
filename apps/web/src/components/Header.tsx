import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export const Header = () => {
  return (
    <header className="bg-white border-b border-zinc-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-12 w-32 sm:h-16 sm:w-40 transition-transform group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Viralatinhas Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/animais" className="text-zinc-600 hover:text-brand-magenta font-medium transition-colors">
              Adoção
            </Link>
            <Link href="/quem-somos" className="text-zinc-600 hover:text-brand-magenta font-medium transition-colors">
              Quem Somos
            </Link>
            <Link href="/como-ajudar" className="text-zinc-600 hover:text-brand-magenta font-medium transition-colors">
              Como Ajudar
            </Link>
            <Link 
              href="/admin" 
              className="bg-brand-blue text-white px-5 py-2.5 rounded-full font-semibold hover:bg-opacity-90 shadow-sm transition-all"
            >
              Painel Admin
            </Link>
          </nav>

          {/* Mobile menu button could go here */}
        </div>
      </div>
    </header>
  )
}
