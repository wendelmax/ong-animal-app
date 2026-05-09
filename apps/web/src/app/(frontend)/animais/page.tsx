import { getPayload } from 'payload'
import config from '@/payload.config'
import React from 'react'
import Link from 'next/link'
import { Heart, Filter, ArrowRight, PawPrint } from 'lucide-react'

export const metadata = {
  title: 'Nossos Animais | Viralatinhas Sumaré',
  description: 'Conheça os cães e gatos disponíveis para adoção responsável em Sumaré.',
}

export default async function AnimalsPage() {
  const payload = await getPayload({ config })

  const { docs: animals } = await payload.find({
    collection: 'animals',
    where: {
      status: {
        equals: 'Disponível',
      },
    },
    sort: '-dataResgate',
  })

  return (
    <div className="min-h-screen bg-zinc-50 pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <Link 
            href="/adocao-responsavel"
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

        {/* Filter Bar (Placeholder for now) */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <button className="px-8 py-3 bg-brand-blue text-white font-black rounded-full shadow-lg shadow-brand-blue/20 hover:scale-105 transition-all">
            Todos
          </button>
          <button className="px-8 py-3 bg-white text-zinc-600 font-bold rounded-full border border-zinc-200 hover:border-brand-blue hover:text-brand-blue transition-all">
            Cachorros
          </button>
          <button className="px-8 py-3 bg-white text-zinc-600 font-bold rounded-full border border-zinc-200 hover:border-brand-blue hover:text-brand-blue transition-all">
            Gatos
          </button>
        </div>

        {/* Animals Grid */}
        {animals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {animals.map((animal) => (
              <Link
                key={animal.id}
                href={`/animais/${animal.slug}`}
                className="group bg-white rounded-[2.5rem] overflow-hidden border border-zinc-100 shadow-sm hover:shadow-2xl transition-all duration-500"
              >
                {/* Photo Container */}
                <div className="relative h-80 overflow-hidden">
                  {animal.fotos?.[0]?.foto && typeof animal.fotos[0].foto === 'object' && 'url' in animal.fotos[0].foto ? (
                    <img
                      src={animal.fotos[0].foto.url || ''}
                      alt={animal.nome}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-200 flex items-center justify-center">
                      <PawPrint className="w-16 h-16 text-zinc-400" />
                    </div>
                  )}
                  
                  {/* Badge */}
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-2 bg-white/90 backdrop-blur-md text-zinc-900 text-xs font-black uppercase tracking-widest rounded-full shadow-sm">
                      {animal.especie}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-3xl font-black text-zinc-900 group-hover:text-brand-blue transition-colors">
                        {animal.nome}
                      </h3>
                      <p className="text-zinc-500 font-bold uppercase text-xs tracking-widest mt-1">
                        {animal.porte} • {animal.idade ? `${animal.idade} anos` : 'Idade desconhecida'}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-brand-magenta group-hover:bg-brand-magenta group-hover:text-white transition-all">
                      <Heart className="w-6 h-6" />
                    </div>
                  </div>

                  <p className="text-zinc-600 line-clamp-2 mb-8 font-medium leading-relaxed">
                    {animal.descricao || 'Um animal amoroso esperando por um lar definitivo.'}
                  </p>

                  <div className="flex items-center gap-2 text-brand-blue font-black uppercase text-sm tracking-widest group-hover:gap-4 transition-all">
                    Conhecer história <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-zinc-200">
            <PawPrint className="w-20 h-20 text-zinc-200 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-zinc-900 mb-4">Nenhum animal disponível no momento</h2>
            <p className="text-zinc-500 font-medium">Continue acompanhando, novos amigos chegam todos os dias!</p>
          </div>
        )}
      </div>
    </div>
  )
}
