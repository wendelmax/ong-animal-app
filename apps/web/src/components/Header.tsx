import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export const Header = () => {
  return (
    <header className="sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-brand-blue py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-white text-xs font-medium">
          <div className="flex items-center gap-4">
            <span>📞 (19) 99708-0388</span>
            <span className="hidden sm:inline">📧 viralatinhas@viralatinhas.com</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://instagram.com/viralatinhasoficial" target="_blank" className="hover:text-brand-orange transition-colors">Instagram</a>
            <a href="#" className="hover:text-brand-orange transition-colors">Facebook</a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white border-b border-zinc-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-12 w-32 sm:h-14 sm:w-40 transition-transform group-hover:scale-105">
                <img
                  src="/logo.png"
                  alt="Viralatinhas Logo"
                  className="h-full w-full object-contain"
                />
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/animais" className="text-zinc-700 hover:text-brand-magenta font-bold transition-colors">
                Adoção
              </Link>
              <Link href="/quem-somos" className="text-zinc-700 hover:text-brand-magenta font-bold transition-colors">
                Sobre Nós
              </Link>
              <Link href="/como-ajudar" className="text-zinc-700 hover:text-brand-magenta font-bold transition-colors">
                Como Ajudar
              </Link>
              <Link href="/transparencia" className="text-zinc-700 hover:text-brand-magenta font-bold transition-colors">
                Transparência
              </Link>
              <Link 
                href="/como-ajudar#doar" 
                className="bg-brand-orange text-white px-6 py-2.5 rounded-full font-black hover:scale-105 shadow-md shadow-brand-orange/20 transition-all uppercase tracking-wider text-sm"
              >
                ❤️ Quero Doar
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}
