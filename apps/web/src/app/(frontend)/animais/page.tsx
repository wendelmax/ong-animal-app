import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'

export const dynamic = 'force-dynamic' // Optional, but useful for testing without caching

export default async function AnimaisPage() {
  const payload = await getPayload({ config: configPromise })

  // Fetch only animals that are 'Disponível' for adoption
  const { docs: animais } = await payload.find({
    collection: 'animals',
    where: {
      status: {
        equals: 'Disponível',
      },
    },
    depth: 1, // To populate media (photos)
  })

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-zinc-900 sm:text-5xl tracking-tight">
            Nossos Focinhos para Adoção
          </h1>
          <p className="mt-4 text-xl text-zinc-600">
            Conheça os animais que estão esperando por um lar cheio de amor.
          </p>
        </div>

        {animais.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-zinc-100">
            <p className="text-zinc-500 text-lg">Nenhum animal disponível para adoção no momento.</p>
            <p className="text-zinc-400 mt-2">Volte mais tarde ou entre em contato com a ONG!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {animais.map((animal) => {
              // Extract the first photo if it exists
              const fotoUrl =
                animal.fotos && animal.fotos.length > 0 && typeof animal.fotos[0].foto === 'object'
                  ? (animal.fotos[0].foto as any).url
                  : '/placeholder-pet.png'

              return (
                <div
                  key={animal.id}
                  className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-zinc-100 overflow-hidden group flex flex-col"
                >
                  <div className="relative h-64 w-full bg-zinc-100 overflow-hidden">
                    <img
                      src={fotoUrl}
                      alt={`Foto de ${animal.nome}`}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-primary">
                      {animal.especie}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h2 className="text-2xl font-bold text-zinc-900 mb-2">{animal.nome}</h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-800">
                        {animal.sexo}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-800">
                        Porte {animal.porte}
                      </span>
                      {animal.idade ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-800">
                          {animal.idade} anos
                        </span>
                      ) : null}
                    </div>
                    <p className="text-zinc-600 line-clamp-3 mb-6">
                      {animal.descricao || 'Este animalzinho está aguardando uma família.'}
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between">
                      <div className="flex space-x-2">
                        {animal.castrado && (
                          <span title="Castrado" className="text-zinc-400">✂️</span>
                        )}
                        {animal.vacinado && (
                          <span title="Vacinado" className="text-zinc-400">💉</span>
                        )}
                      </div>
                      <Link
                        href={`/animais/${animal.slug}`}
                        className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-xl text-white bg-primary hover:bg-orange-600 shadow-sm transition-colors"
                      >
                        Conhecer
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
