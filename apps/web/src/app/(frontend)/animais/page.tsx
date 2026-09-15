import { getPayload } from 'payload'
import config from '@/payload.config'
import React from 'react'
import Link from 'next/link'
import { Heart, ArrowRight, PawPrint } from 'lucide-react'

export const metadata = {
  title: 'Nossos Animais para Adoção | Viralatinhas Sumaré',
  description: 'Conheça os cães e gatos resgatados disponíveis para adoção responsável em Sumaré.',
}

export const dynamic = 'force-dynamic'

interface AnimalsPageProps {
  searchParams: Promise<{
    especie?: string
  }>
}

export default async function AnimalsPage({ searchParams }: AnimalsPageProps) {
  const { especie } = (await searchParams) || {}
  const payload = await getPayload({ config })

  const whereConditions: any = {
    status: {
      equals: 'Disponível',
    },
  }

  if (especie && (especie === 'Cachorro' || especie === 'Gato')) {
    whereConditions.especie = {
      equals: especie,
    }
  }

  let animals: any[] = []
  try {
    const result = await payload.find({
      collection: 'animals',
      where: whereConditions,
      sort: '-dataResgate',
    })
    animals = result.docs || []
  } catch (err) {
    console.error('Erro ao buscar animais:', err)
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <Link
            href="/quem-somos"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-black mb-6 uppercase tracking-widest hover:bg-brand-orange hover:text-white transition-all cursor-pointer"
          >
            <PawPrint className="w-4 h-4" /> Adoção Responsável
          </Link>
          <h1 className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tighter mb-6">
            Encontre seu novo <br />
            <span className="text-brand-magenta">melhor amigo.</span>
          </h1>
          <p className="text-xl text-zinc-600 max-w-2xl mx-auto font-medium">
            Todos os nossos animais são entregues castrados, vacinados e com muito amor para oferecer.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            href="/animais"
            className={`px-8 py-3 rounded-full transition-all text-sm font-black flex items-center gap-2 ${
              !especie
                ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20 scale-105'
                : 'bg-white text-zinc-600 border border-zinc-200 hover:border-brand-blue hover:text-brand-blue'
            }`}
          >
            🐾 Todos
          </Link>
          <Link
            href="/animais?especie=Cachorro"
            className={`px-8 py-3 rounded-full transition-all text-sm font-black flex items-center gap-2 ${
              especie === 'Cachorro'
                ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20 scale-105'
                : 'bg-white text-zinc-600 border border-zinc-200 hover:border-brand-blue hover:text-brand-blue'
            }`}
          >
            🐶 Cachorros
          </Link>
          <Link
            href="/animais?especie=Gato"
            className={`px-8 py-3 rounded-full transition-all text-sm font-black flex items-center gap-2 ${
              especie === 'Gato'
                ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20 scale-105'
                : 'bg-white text-zinc-600 border border-zinc-200 hover:border-brand-blue hover:text-brand-blue'
            }`}
          >
            🐱 Gatos
          </Link>
        </div>

        {/* Animals Grid */}
        {animals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {animals.map((animal) => {
              const photoUrl =
                animal.fotos?.[0]?.foto && typeof animal.fotos[0].foto === 'object' && 'url' in animal.fotos[0].foto
                  ? animal.fotos[0].foto.url
                  : null

              return (
                <Link
                  key={animal.id}
                  href={`/animais/${animal.slug}`}
                  className="group bg-white rounded-[2.5rem] overflow-hidden border border-zinc-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col"
                >
                  {/* Photo Container */}
                  <div className="relative h-80 overflow-hidden bg-zinc-100">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={animal.nome}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-100 flex items-center justify-center">
                        <PawPrint className="w-16 h-16 text-zinc-300" />
                      </div>
                    )}

                    {/* Badge */}
                    <div className="absolute top-6 left-6">
                      <span className="px-4 py-2 bg-white/95 backdrop-blur-md text-zinc-900 text-xs font-black uppercase tracking-widest rounded-full shadow-sm">
                        {animal.especie}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-10 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-3xl font-black text-zinc-900 group-hover:text-brand-blue transition-colors">
                          {animal.nome}
                        </h2>
                        <p className="text-zinc-500 font-bold uppercase text-xs tracking-widest mt-1">
                          {animal.porte} • {animal.idade ? `${animal.idade} anos` : 'Idade em avaliação'}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-brand-magenta group-hover:bg-brand-magenta group-hover:text-white transition-all">
                        <Heart className="w-6 h-6" />
                      </div>
                    </div>

                    <p className="text-zinc-600 line-clamp-2 mb-8 font-medium leading-relaxed flex-1">
                      {animal.descricao || 'Um animal amoroso esperando por um lar definitivo e carinho.'}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-zinc-100 text-brand-blue font-black uppercase text-sm tracking-widest group-hover:text-brand-magenta transition-colors">
                      <span>Conhecer história</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-zinc-200">
            <PawPrint className="w-20 h-20 text-zinc-200 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-zinc-900 mb-4">
              {especie ? `Nenhum ${especie.toLowerCase()} disponível no momento` : 'Nenhum animal disponível no momento'}
            </h2>
            <p className="text-zinc-500 font-medium mb-6">Continue acompanhando, novos amigos chegam com frequência!</p>
            {especie && (
              <Link
                href="/animais"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-full font-bold text-sm hover:scale-105 transition-all"
              >
                Ver todos os animais
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
