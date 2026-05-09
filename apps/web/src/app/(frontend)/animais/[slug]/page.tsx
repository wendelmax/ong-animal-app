import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import React from 'react'
import { 
  Heart, 
  Calendar, 
  ShieldCheck, 
  Info, 
  ArrowLeft, 
  Share2, 
  CheckCircle2, 
  Clock,
  Activity,
  User
} from 'lucide-react'
import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function AnimalDetailPage({ params }: PageProps) {
  const { slug } = await params
  const payload = await getPayload({ config })

  // Fetch Animal
  const animalResult = await payload.find({
    collection: 'animals',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  })

  const animal = animalResult.docs[0]

  if (!animal) {
    return notFound()
  }

  // Fetch Events (Timeline)
  const eventsResult = await payload.find({
    collection: 'animal-events',
    where: {
      animal: {
        equals: animal.id,
      },
      publico: {
        equals: true,
      },
    },
    sort: '-data',
  })

  const events = eventsResult.docs

  return (
    <div className="min-h-screen bg-white pt-24 pb-24">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <Link 
          href="/animais" 
          className="inline-flex items-center gap-2 text-zinc-500 font-bold hover:text-brand-blue transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Voltar para a vitrine
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left Column: Photos & Content */}
          <div className="lg:col-span-8">
            {/* Gallery */}
            <div className="grid grid-cols-1 gap-4 mb-12">
              {animal.fotos?.[0]?.foto && typeof animal.fotos[0].foto === 'object' && 'url' in animal.fotos[0].foto ? (
                <div className="rounded-[3rem] overflow-hidden shadow-2xl border border-zinc-100 h-[600px]">
                  <img
                    src={animal.fotos[0].foto.url || ''}
                    alt={animal.nome}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="rounded-[3rem] bg-zinc-100 h-[400px] flex items-center justify-center">
                  <Activity className="w-20 h-20 text-zinc-300" />
                </div>
              )}
            </div>

            {/* Title & Info */}
            <div className="mb-12">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="px-4 py-2 bg-brand-blue/10 text-brand-blue text-sm font-black rounded-full uppercase tracking-widest">
                  {animal.especie}
                </span>
                <span className="px-4 py-2 bg-brand-magenta/10 text-brand-magenta text-sm font-black rounded-full uppercase tracking-widest">
                  {animal.porte}
                </span>
                <span className="px-4 py-2 bg-brand-orange/10 text-brand-orange text-sm font-black rounded-full uppercase tracking-widest">
                  {animal.status}
                </span>
              </div>
              <h1 className="text-6xl md:text-7xl font-black text-zinc-900 mb-8 tracking-tighter">
                {animal.nome}
              </h1>
              
              <div className="prose prose-xl max-w-none text-zinc-600 font-medium leading-relaxed">
                {animal.historia ? (
                  <RichText data={animal.historia} />
                ) : (
                  <p>{animal.descricao || 'Um animal maravilhoso em busca de uma nova família.'}</p>
                )}
              </div>
            </div>

            {/* Health Info Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
              {[
                { label: 'Castrado', value: animal.castrado },
                { label: 'Vacinado', value: animal.vacinado },
                { label: 'Vermifugado', value: animal.vermifugado },
                { label: 'Microchipado', value: animal.microchipado },
              ].map((item) => (
                <div key={item.label} className={`p-6 rounded-3xl border-2 transition-all ${item.value ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-zinc-100 bg-zinc-50 text-zinc-400'}`}>
                  <CheckCircle2 className={`w-6 h-6 mb-3 ${item.value ? 'text-emerald-500' : 'text-zinc-300'}`} />
                  <p className="font-black uppercase text-[10px] tracking-widest mb-1">{item.label}</p>
                  <p className="font-bold text-lg">{item.value ? 'Sim' : 'Não'}</p>
                </div>
              ))}
            </div>

            {/* Timeline (Events) */}
            <div className="bg-zinc-50 rounded-[3rem] p-12 border border-zinc-100">
              <h2 className="text-3xl font-black text-zinc-900 mb-10 flex items-center gap-3">
                <Clock className="w-8 h-8 text-brand-blue" /> Diário do {animal.nome}
              </h2>
              
              <div className="space-y-12 relative before:absolute before:left-6 before:top-4 before:bottom-0 before:w-1 before:bg-zinc-200">
                {events.length > 0 ? (
                  events.map((event) => (
                    <div key={event.id} className="relative pl-16 group">
                      <div className="absolute left-[20px] top-1 w-3 h-3 rounded-full bg-brand-blue border-4 border-white ring-4 ring-zinc-50 group-hover:scale-150 transition-transform" />
                      <div className="text-sm font-black text-brand-blue uppercase tracking-widest mb-2">
                        {new Date(event.data).toLocaleDateString('pt-BR')}
                      </div>
                      <h3 className="text-xl font-black text-zinc-900 mb-2">{event.tipo}</h3>
                      <p className="text-zinc-600 font-medium leading-relaxed">{event.descricao}</p>
                    </div>
                  ))
                ) : (
                  <div className="relative pl-16">
                    <div className="absolute left-[20px] top-1 w-3 h-3 rounded-full bg-zinc-300 border-4 border-white ring-4 ring-zinc-50" />
                    <p className="text-zinc-400 font-bold uppercase text-sm tracking-widest">Iniciando a jornada...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar / CTA */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
              {/* Adoption CTA Card */}
              <div className="bg-brand-blue rounded-[2.5rem] p-10 text-white shadow-2xl shadow-brand-blue/30 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                
                <h3 className="text-3xl font-black mb-6 leading-tight">
                  Levando o {animal.nome} para casa?
                </h3>
                <p className="text-brand-blue-100 font-medium mb-10 opacity-90 leading-relaxed">
                  Adoção é um ato de amor e responsabilidade. Se você está pronto para essa jornada, comece agora seu pedido.
                </p>
                
                <Link 
                  href={`/adotar?pet=${animal.slug}`}
                  className="w-full py-5 bg-white text-brand-blue font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-brand-orange hover:text-white transition-all shadow-xl"
                >
                  Iniciar Adoção <Heart className="w-6 h-6 fill-current" />
                </Link>

                <p className="mt-6 text-center text-xs font-bold text-white/60 uppercase tracking-widest">
                  Processo 100% digital e seguro
                </p>
              </div>

              {/* Share Card */}
              <div className="bg-zinc-50 rounded-[2rem] p-8 border border-zinc-100">
                <h4 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-6">Ajude divulgando</h4>
                <div className="flex gap-4">
                  <button className="flex-1 py-4 bg-white border border-zinc-200 rounded-xl flex items-center justify-center gap-2 font-black text-brand-blue hover:border-brand-blue transition-all">
                    <Share2 className="w-5 h-5" /> Compartilhar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
