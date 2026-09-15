'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Heart, PawPrint } from 'lucide-react'

export interface NavItem {
  label: string
  url: string
}

interface HeaderNavProps {
  items?: NavItem[]
}

const defaultNavItems: NavItem[] = [
  { label: 'Adoção', url: '/animais' },
  { label: 'Notícias', url: '/noticias' },
  { label: 'Sobre Nós', url: '/quem-somos' },
  { label: 'Como Ajudar', url: '/como-ajudar' },
  { label: 'Transparência', url: '/transparencia' },
]

export const HeaderNav: React.FC<HeaderNavProps> = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false)
  const navItems = items && items.length > 0 ? items : defaultNavItems

  const toggleMenu = () => setIsOpen((prev) => !prev)
  const closeMenu = () => setIsOpen(false)

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-8">
        {navItems.map((item) => (
          <Link
            key={item.url}
            href={item.url}
            className="text-zinc-700 hover:text-brand-magenta font-bold transition-colors text-sm lg:text-base"
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/como-ajudar#doar"
          className="bg-brand-orange text-white px-6 py-2.5 rounded-full font-black hover:scale-105 shadow-md shadow-brand-orange/20 transition-all uppercase tracking-wider text-sm flex items-center gap-2"
        >
          <Heart className="w-4 h-4 fill-current" /> Quero Doar
        </Link>
      </nav>

      {/* Mobile Hamburger Button */}
      <div className="md:hidden flex items-center gap-3">
        <Link
          href="/como-ajudar#doar"
          className="bg-brand-orange text-white px-4 py-2 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
        >
          <Heart className="w-3.5 h-3.5 fill-current" /> Doar
        </Link>

        <button
          onClick={toggleMenu}
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
          className="p-2.5 rounded-xl bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors cursor-pointer"
        >
          {isOpen ? <X className="w-6 h-6 text-brand-magenta" /> : <Menu className="w-6 h-6 text-zinc-800" />}
        </button>
      </div>

      {/* Mobile Drawer / Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-x-0 top-[108px] bottom-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in" onClick={closeMenu}>
          <div
            className="bg-white border-b border-zinc-200 p-6 shadow-2xl flex flex-col gap-4 animate-slide-down"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.url}
                  href={item.url}
                  onClick={closeMenu}
                  className="px-4 py-3 rounded-2xl text-zinc-800 font-bold hover:bg-zinc-100 hover:text-brand-blue transition-colors flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  <span className="text-zinc-300">→</span>
                </Link>
              ))}
            </div>

            <div className="pt-4 border-t border-zinc-100 flex flex-col gap-3">
              <Link
                href="/como-ajudar#doar"
                onClick={closeMenu}
                className="w-full py-4 bg-brand-orange text-white rounded-2xl font-black text-center uppercase tracking-wider text-sm shadow-lg shadow-brand-orange/30 flex items-center justify-center gap-2"
              >
                <Heart className="w-5 h-5 fill-current" /> Fazer uma Doação
              </Link>
              <Link
                href="/adotar"
                onClick={closeMenu}
                className="w-full py-3.5 bg-brand-blue/10 text-brand-blue rounded-2xl font-black text-center uppercase tracking-wider text-sm hover:bg-brand-blue hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <PawPrint className="w-4 h-4" /> Quero Adotar
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
