import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import React from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'

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
    <article className="min-h-screen bg-white pb-20">
      {/* Page Hero */}
      <section className="bg-brand-blue py-16 md:py-24 text-center mb-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-magenta/20 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4 drop-shadow-sm">
            {page.title}
          </h1>
          <div className="h-1.5 w-24 bg-brand-orange mx-auto rounded-full" />
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="prose prose-lg prose-zinc max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:leading-relaxed">
          {page.content && <RichText data={page.content} />}
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
