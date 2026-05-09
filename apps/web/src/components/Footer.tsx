import React from 'react'
import Link from 'next/link'

export const Footer = () => {
  return (
    <footer className="bg-zinc-900 text-zinc-300 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <div className="bg-white p-4 rounded-xl inline-block mb-6">
              <img src="/logo.png" alt="Viralatinhas Logo" className="h-12 w-auto" />
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Atuamos na proteção e bem-estar de cães e gatos em Sumaré-SP desde 2002.
              Focados em castração e adoção responsável.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Links Úteis</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/quem-somos" className="hover:text-brand-orange transition-colors">Quem Somos</Link></li>
              <li><Link href="/animais" className="hover:text-brand-orange transition-colors">Quero Adotar</Link></li>
              <li><Link href="/como-ajudar" className="hover:text-brand-orange transition-colors">Como Ajudar</Link></li>
              <li><a href="/admin" className="hover:text-brand-orange transition-colors">Área Restrita</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Contato</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <span>📍</span> Sumaré, São Paulo - Brasil
              </li>
              <li className="flex items-start gap-3">
                <span>📱</span> (19) 99708-0388
              </li>
              <li className="flex items-start gap-3">
                <span>✉️</span> viralatinhas@gmail.com
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Siga-nos</h4>
            <div className="flex gap-4">
              <a 
                href="https://instagram.com/viralatinhasoficial" 
                target="_blank" 
                className="bg-zinc-800 p-3 rounded-full hover:bg-brand-magenta hover:text-white transition-all"
              >
                Instagram
              </a>
            </div>
            <div className="mt-8">
              <p className="text-xs text-zinc-500 italic">
                "Não possuímos abrigo. Atuamos na intermediação e suporte."
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} Viralatinhas Sumaré. Todos os direitos reservados.
          </p>
          <p className="text-xs text-zinc-600">
            ONG Viralatinhas - Sumaré/SP
          </p>
        </div>
      </div>
    </footer>
  )
}
