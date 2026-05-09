import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import React from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Mail, Phone, Camera, Heart, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'pages',
    where: {
      slug: {
        equals: slug,
      },
      status: {
        equals: 'Publicado',
      },
    },
    limit: 1,
  })

  const page = result.docs[0]

  if (!page) {
    return notFound()
  }

  return (
    <article className="min-h-screen bg-white pb-24">
      {/* Page Hero */}
      <section className="bg-brand-blue py-20 md:py-32 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-magenta/30 via-transparent to-brand-orange/20 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 drop-shadow-md">
            {page.title}
          </h1>
          <div className="h-2 w-32 bg-brand-orange mx-auto rounded-full shadow-lg" />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="flex-1 bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-zinc-100">
            <div className="prose prose-lg prose-zinc max-w-none 
              prose-headings:font-black prose-headings:text-zinc-900 prose-headings:tracking-tight 
              prose-p:leading-relaxed prose-p:text-zinc-600
              prose-li:text-zinc-600
              prose-strong:text-brand-blue prose-strong:font-black">
              {page.content && <RichText data={page.content} />}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 space-y-8">
            {/* Contact Card */}
            <div className="bg-zinc-50 p-8 rounded-3xl border border-zinc-100 shadow-sm">
              <h3 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-2">
                <Phone className="w-5 h-5 text-brand-magenta" /> Contato
              </h3>
              <ul className="space-y-4">
                <li className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">WhatsApp</span>
                  <a href="https://wa.me/5519997080388" className="text-zinc-700 font-bold hover:text-brand-magenta transition-colors">
                    (19) 99708-0388
                  </a>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">E-mail</span>
                  <a href="mailto:viralatinhas@viralatinhas.com" className="text-zinc-700 font-bold hover:text-brand-magenta transition-colors break-all">
                    viralatinhas@viralatinhas.com
                  </a>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Siga-nos</span>
                  <a href="https://instagram.com/viralatinhasoficial" className="text-zinc-700 font-bold hover:text-brand-magenta transition-colors flex items-center gap-2">
                    <Camera className="w-4 h-4" /> @viralatinhasoficial
                  </a>
                </li>
              </ul>
            </div>

            {/* CTA Card */}
            <div className="bg-gradient-to-br from-brand-orange to-orange-600 p-8 rounded-3xl text-white shadow-xl shadow-brand-orange/20">
              <Heart className="w-10 h-10 mb-6 text-white" />
              <h3 className="text-2xl font-black mb-4">Ajude a Causa</h3>
              <p className="text-orange-50 mb-8 font-medium leading-relaxed">
                Sua doação ajuda a financiar castrações e tratamentos para vira-latinhas.
              </p>
              <Link 
                href="/como-ajudar"
                className="w-full py-4 bg-white text-brand-orange font-black rounded-xl hover:bg-brand-blue hover:text-white transition-all flex items-center justify-center gap-2"
              >
                Como Ajudar <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </article>
  )
}

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const pages = await payload.find({
    collection: 'pages',
    limit: 100,
    select: {
      slug: true,
    },
  })

  return pages.docs.map((doc) => ({
    slug: doc.slug,
  }))
}
