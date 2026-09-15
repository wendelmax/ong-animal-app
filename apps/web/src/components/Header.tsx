import React from 'react'
import Link from 'next/link'
import { HeaderNav, NavItem } from './HeaderNav'
import { getPayload } from 'payload'
import config from '@/payload.config'

export const Header = async () => {
  let navItems: NavItem[] | undefined

  try {
    const payload = await getPayload({ config })
    const headerGlobal = await payload.findGlobal({
      slug: 'header',
    })
    if (headerGlobal?.navItems && headerGlobal.navItems.length > 0) {
      navItems = headerGlobal.navItems.map((item: any) => ({
        label: item.label,
        url: item.url,
      }))
    }
  } catch (err) {
    // Fallback silencioso para itens padrão caso DB ainda esteja inicializando
  }

  return (
    <header className="sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-brand-blue py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-white text-xs font-medium">
          <div className="flex items-center gap-4">
            <a href="https://wa.me/5519997080388" target="_blank" rel="noopener noreferrer" className="hover:text-brand-orange transition-colors">
              📞 (19) 99708-0388
            </a>
            <a href="mailto:viralatinhas@viralatinhas.com" className="hidden sm:inline hover:text-brand-orange transition-colors">
              📧 viralatinhas@viralatinhas.com
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/viralatinhasoficial"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-orange transition-colors"
            >
              Instagram
            </a>
            <a
              href="https://facebook.com/viralatinhasoficial"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-orange transition-colors"
            >
              Facebook
            </a>
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

            <HeaderNav items={navItems} />
          </div>
        </div>
      </div>
    </header>
  )
}
