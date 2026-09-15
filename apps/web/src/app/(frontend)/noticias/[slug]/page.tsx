import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import React from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { ArrowLeft, Calendar, Heart, Share2, Tag } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config })

  let post = (
    await payload.find({
      collection: 'posts',
      where: { slug: { equals: slug } },
      limit: 1,
    })
  ).docs[0]

  if (!post) {
    try {
      post = await payload.findByID({ collection: 'posts', id: slug })
    } catch {
      // not an id
    }
  }

  if (!post) {
    return {
      title: 'Notícia não encontrada | Viralatinhas Sumaré',
    }
  }

  return {
    title: `${post.title} | Viralatinhas Sumaré`,
    description: post.excerpt || 'Notícia da Associação Viralatinhas de Sumaré.',
  }
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params
  const payload = await getPayload({ config })

  // Tenta buscar por slug
  let post = (
    await payload.find({
      collection: 'posts',
      where: { slug: { equals: slug } },
      limit: 1,
    })
  ).docs[0]

  // Fallback para ID numérico ou UUID
  if (!post) {
    try {
      post = await payload.findByID({ collection: 'posts', id: slug })
    } catch {
      // ignore
    }
  }

  if (!post) {
    return notFound()
  }

  const coverImage =
    post.coverImage && typeof post.coverImage === 'object' && 'url' in post.coverImage
      ? post.coverImage.url
      : null

  const categoryTitle =
    post.category && typeof post.category === 'object' && 'title' in post.category
      ? (post.category as any).title
      : null

  return (
    <article className="min-h-screen bg-zinc-50 pt-24 pb-24">
      {/* Back button */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <Link
          href="/noticias"
          className="inline-flex items-center gap-2 text-zinc-500 font-bold hover:text-brand-blue transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Voltar para todas as notícias
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Article Header */}
        <header className="mb-10 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            {categoryTitle && (
              <span className="px-4 py-1.5 bg-brand-blue/10 text-brand-blue text-xs font-black uppercase tracking-wider rounded-full">
                {categoryTitle}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-zinc-400 font-bold text-xs uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('pt-BR') : ''}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter leading-tight mb-8">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-xl text-zinc-600 font-medium leading-relaxed max-w-2xl mx-auto">
              {post.excerpt}
            </p>
          )}
        </header>

        {/* Cover Image */}
        {coverImage && (
          <div className="mb-12 rounded-[2.5rem] overflow-hidden shadow-2xl border border-zinc-100 max-h-[500px] bg-zinc-100">
            <img src={coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Article Content */}
        <div className="bg-white p-8 md:p-14 rounded-[2.5rem] shadow-xl border border-zinc-100 mb-16">
          <div
            className="prose prose-lg prose-zinc max-w-none 
              prose-headings:font-black prose-headings:text-zinc-900 prose-headings:tracking-tight 
              prose-p:leading-relaxed prose-p:text-zinc-600 prose-p:font-medium
              prose-li:text-zinc-600
              prose-strong:text-brand-blue prose-strong:font-black"
          >
            {post.content && <RichText data={post.content} />}
          </div>
        </div>

        {/* CTA Card */}
        <div className="bg-gradient-to-br from-brand-orange to-amber-600 p-10 rounded-[2.5rem] text-white shadow-xl shadow-brand-orange/20 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div>
            <Heart className="w-10 h-10 mb-4 text-white" />
            <h3 className="text-3xl font-black mb-2">Apoie nossa causa</h3>
            <p className="text-amber-100 font-medium max-w-md">
              Sua doação ajuda a salvar e transformar a vida de cães e gatos em Sumaré.
            </p>
          </div>
          <Link
            href="/como-ajudar"
            className="px-8 py-4 bg-white text-brand-orange font-black rounded-xl hover:bg-brand-blue hover:text-white transition-all shadow-lg flex-shrink-0 text-center"
          >
            Quero Ajudar ❤️
          </Link>
        </div>
      </div>
    </article>
  )
}
