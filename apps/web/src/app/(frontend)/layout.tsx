import React from 'react'
import './styles.css'

export const metadata = {
  metadataBase: new URL('https://www.viralatinhas.com'),
  title: {
    default: 'Viralatinhas Sumaré',
    template: '%s | Viralatinhas Sumaré',
  },
  description: 'ONG independente dedicada à proteção e bem-estar de cães e gatos em Sumaré-SP.',
}

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Analytics } from '@vercel/analytics/next'

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
