import React from 'react'
import './styles.css'

export const metadata = {
  metadataBase: new URL('https://www.viralatinhas.com'),
  title: {
    default: 'Viralatinhas Sumaré - Proteção Animal em Sumaré-SP',
    template: '%s | Viralatinhas Sumaré',
  },
  description: 'Atuamos na proteção e bem-estar de cães e gatos em Sumaré-SP desde 2002. Adote um amigo ou ajude nossa causa.',
  openGraph: {
    title: 'Viralatinhas Sumaré',
    description: 'Proteção e bem-estar de cães e gatos em Sumaré-SP.',
    url: 'https://www.viralatinhas.com',
    siteName: 'Viralatinhas Sumaré',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Viralatinhas Sumaré Logo',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Viralatinhas Sumaré',
    description: 'Proteção e bem-estar de cães e gatos em Sumaré-SP.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Analytics } from '@vercel/analytics/react'

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="pt-BR">
      <body>
        <Header />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
