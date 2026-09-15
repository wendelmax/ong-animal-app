import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@/payload.config'

export const Footer = async () => {
  let footerData: any = null

  try {
    const payload = await getPayload({ config })
    footerData = await payload.findGlobal({ slug: 'footer' })
  } catch (err) {
    // Fallback silencioso caso o banco ainda esteja iniciando
  }

  const currentYear = new Date().getFullYear()
  const copyrightText = footerData?.copyright || `© ${currentYear} Viralatinhas Sumaré. Todos os direitos reservados.`
  const socialLinks: { platform: string; url: string }[] = footerData?.socialLinks?.length
    ? footerData.socialLinks
    : [
        { platform: 'Instagram', url: 'https://instagram.com/viralatinhasoficial' },
        { platform: 'Facebook', url: 'https://facebook.com/viralatinhasoficial' },
      ]

  return (
    <footer className="bg-zinc-900 text-zinc-300 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-sm">
              <img src="/logo.png" alt="Viralatinhas Logo" className="h-12 w-auto object-contain" />
            </div>
            <p className="text-sm leading-relaxed mb-6 text-zinc-400">
              Atuamos na proteção e bem-estar de cães e gatos em Sumaré-SP desde 2002.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Links Úteis</h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link href="/animais" className="hover:text-brand-orange transition-colors">
                  Quero Adotar
                </Link>
              </li>
              <li>
                <Link href="/noticias" className="hover:text-brand-orange transition-colors">
                  Notícias & Ações
                </Link>
              </li>
              <li>
                <Link href="/quem-somos" className="hover:text-brand-orange transition-colors">
                  Quem Somos
                </Link>
              </li>
              <li>
                <Link href="/como-ajudar" className="hover:text-brand-orange transition-colors">
                  Como Ajudar
                </Link>
              </li>
              <li>
                <Link href="/transparencia" className="hover:text-brand-orange transition-colors">
                  Transparência
                </Link>
              </li>
              <li>
                <a href="/admin" className="text-zinc-500 hover:text-brand-orange transition-colors">
                  Área Restrita (Admin)
                </a>
              </li>
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
                <span>📱</span>
                <a
                  href="https://wa.me/5519997080388"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-orange transition-colors"
                >
                  (19) 99708-0388 (WhatsApp)
                </a>
              </li>
              <li className="flex items-start gap-3">
                <span>✉️</span>
                <a
                  href="mailto:viralatinhas@viralatinhas.com"
                  className="hover:text-brand-orange transition-colors break-all"
                >
                  viralatinhas@viralatinhas.com
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Siga-nos</h4>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-zinc-800 px-4 py-2 rounded-full text-xs font-bold hover:bg-brand-magenta hover:text-white transition-all"
                >
                  {social.platform}
                </a>
              ))}
            </div>
            <div className="mt-8">
              <p className="text-xs text-zinc-500 italic leading-relaxed">
                "Não possuímos abrigo. Atuamos com rede de voluntários, castrações e lares temporários."
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-500">{copyrightText}</p>
          <p className="text-xs text-zinc-600">Associação Viralatinhas de Sumaré - Sumaré/SP</p>
        </div>
      </div>
    </footer>
  )
}
