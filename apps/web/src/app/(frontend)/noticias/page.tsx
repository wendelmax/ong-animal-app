import { getPayload } from 'payload'
import config from '@/payload.config'
import React from 'react'
import Link from 'next/link'
import { BookOpen, ArrowRight, Calendar, Tag } from 'lucide-react'

export const metadata = {
  title: 'Notícias e Ações | Viralatinhas Sumaré',
  description: 'Acompanhe as últimas notícias, histórias de resgate, campanhas de castração e eventos da Viralatinhas.',
}

export const dynamic = 'force-dynamic'

export default async function NewsPage() {
  let posts: any[] = []

  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'posts',
      limit: 20,
      sort: '-publishedAt',
    })
    posts = result.docs || []
  } catch (err) {
    console.error('Erro ao buscar notícias:', err)
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/10 text-brand-blue text-sm font-black mb-6 uppercase tracking-widest">
            <BookOpen className="w-4 h-4" /> Notícias & Novidades
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tighter mb-6">
            Acompanhe nossas <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-magenta">
              histórias e ações.
            </span>
          </h1>
          <p className="text-xl text-zinc-600 max-w-2xl mx-auto font-medium">
            Fique por dentro das feiras de adoção, campanhas de castração, prestação de contas e finais felizes.
          </p>
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {posts.map((post) => {
              const coverImage =
                post.coverImage && typeof post.coverImage === 'object' && 'url' in post.coverImage
                  ? post.coverImage.url
                  : '/placeholder-news.jpg'

              const postSlug = post.slug || post.id
              const categoryTitle =
                post.category && typeof post.category === 'object' && 'title' in post.category
                  ? (post.category as any).title
                  : null

              return (
                <Link
                  key={post.id}
                  href={`/noticias/${postSlug}`}
                  className="group flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-zinc-100 shadow-sm hover:shadow-2xl transition-all duration-500"
                >
                  <div className="relative h-64 overflow-hidden bg-zinc-100">
                    <img
                      src={coverImage || '/placeholder-news.jpg'}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {categoryTitle && (
                      <div className="absolute top-6 left-6">
                        <span className="px-4 py-1.5 bg-white/95 backdrop-blur-md text-brand-blue text-xs font-black uppercase tracking-wider rounded-full shadow-sm">
                          {categoryTitle}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">
                      <Calendar className="w-4 h-4" />
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('pt-BR') : ''}
                    </div>

                    <h2 className="text-2xl font-black text-zinc-900 mb-4 group-hover:text-brand-blue transition-colors line-clamp-2">
                      {post.title}
                    </h2>

                    {post.excerpt && (
                      <p className="text-zinc-600 font-medium line-clamp-3 mb-6 flex-1 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between text-brand-blue font-black uppercase text-sm tracking-widest group-hover:text-brand-magenta transition-colors">
                      <span>Ler matéria</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-zinc-200">
            <BookOpen className="w-20 h-20 text-zinc-200 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-zinc-900 mb-4">Ainda não temos publicações registradas</h2>
            <p className="text-zinc-500 font-medium">Em breve compartilharemos novidades, resgates e ações por aqui.</p>
          </div>
        )}
      </div>
    </div>
  )
}
