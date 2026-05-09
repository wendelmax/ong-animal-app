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
    <article className="min-h-screen bg-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tight mb-4">
            {page.title}
          </h1>
          <div className="h-1.5 w-24 bg-gradient-to-r from-brand-blue via-brand-magenta to-brand-orange mx-auto rounded-full" />
        </header>

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
