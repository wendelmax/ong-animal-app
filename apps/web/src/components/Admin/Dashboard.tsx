import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'

export default async function Dashboard() {
  let activeAnimals = 0
  let availableAnimals = 0
  let ltAnimals = 0
  let totalIncome = 0
  let totalExpenses = 0
  let pendingCount = 0
  let animalDocs: any[] = []
  let recentEventDocs: any[] = []
  let latestAdoptionDocs: any[] = []

  try {
    const payload = await getPayload({ config })

    const animals = await payload.find({ collection: 'animals', limit: 1000 })
    animalDocs = animals.docs
    availableAnimals = animals.docs.filter((a: any) => a.status === 'Disponível').length
    ltAnimals = animals.docs.filter((a: any) => a.status === 'Lar temporário').length
    activeAnimals = animals.docs.filter((a: any) => a.status !== 'Adotado' && a.status !== 'Falecido').length

    const transactions = await payload.find({ collection: 'transactions', limit: 100 })
    totalIncome = transactions.docs
      .filter((t: any) => t.tipo === 'Receita' || t.tipo === 'Doação')
      .reduce((acc: number, t: any) => acc + (t.valor || 0), 0)
    totalExpenses = transactions.docs
      .filter((t: any) => t.tipo === 'Despesa')
      .reduce((acc: number, t: any) => acc + (t.valor || 0), 0)

    const pendingAdoptions = await payload.find({
      collection: 'adoption-requests',
      where: { status: { equals: 'Interessado' } },
    })
    pendingCount = pendingAdoptions.totalDocs

    const recentEvents = await payload.find({
      collection: 'animal-events',
      limit: 5,
      sort: '-createdAt',
    })
    recentEventDocs = recentEvents.docs

    const latestAdoptions = await payload.find({
      collection: 'adoption-requests',
      limit: 3,
      sort: '-createdAt',
    })
    latestAdoptionDocs = latestAdoptions.docs
  } catch (e) {
    // silently handle DB errors so dashboard still renders
  }

  const statusColor = (status: string) => {
    if (status === 'Disponível') return { background: '#ecfdf5', color: '#059669' }
    if (status === 'Em tratamento') return { background: '#fff7ed', color: '#d97706' }
    if (status === 'Adotado') return { background: '#eff6ff', color: '#2563eb' }
    if (status === 'Lar temporário') return { background: '#fef3c7', color: '#b45309' }
    return { background: '#f3f4f6', color: '#6b7280' }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh', background: '#f8fafc' }}>

      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
            Olá, Equipe Viralatinhas! 👋
          </h1>
          <p style={{ color: '#6b7280', fontWeight: 500, marginTop: '0.25rem', fontSize: '1rem' }}>
            Aqui está um resumo da nossa missão hoje.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link
            href="/admin/collections/animals/create"
            style={{ padding: '0.75rem 1.5rem', background: '#1e3a8a', color: '#fff', fontWeight: 700, borderRadius: '0.75rem', textDecoration: 'none', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            + Novo Animal
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {/* Animais Ativos */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e5e7eb', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-8px', top: '-8px', width: '60px', height: '60px', background: 'rgba(30,58,138,0.06)', borderRadius: '50%' }} />
          <p style={{ color: '#9ca3af', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Animais Ativos</p>
          <h3 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#111827', margin: 0 }}>{activeAnimals}</h3>
          <p style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.25rem' }}>{availableAnimals} disponíveis</p>
        </div>

        {/* Para Adoção */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e5e7eb', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-8px', top: '-8px', width: '60px', height: '60px', background: 'rgba(190,24,93,0.06)', borderRadius: '50%' }} />
          <p style={{ color: '#9ca3af', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Para Adoção</p>
          <h3 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#111827', margin: 0 }}>{availableAnimals}</h3>
          <p style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.25rem' }}>Aguardando um lar</p>
        </div>

        {/* Lar Temporário */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e5e7eb', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-8px', top: '-8px', width: '60px', height: '60px', background: 'rgba(245,158,11,0.06)', borderRadius: '50%' }} />
          <p style={{ color: '#9ca3af', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Em Lar Temporário</p>
          <h3 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#111827', margin: 0 }}>{ltAnimals}</h3>
          <p style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.25rem' }}>Hospedados em LTs</p>
        </div>

        {/* Tratamentos */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e5e7eb', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-8px', top: '-8px', width: '60px', height: '60px', background: 'rgba(16,185,129,0.06)', borderRadius: '50%' }} />
          <p style={{ color: '#9ca3af', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Arrecadado (Mês)</p>
          <h3 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#111827', margin: 0 }}>
            R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.25rem' }}>
            R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} despesas
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>

        {/* Animais Recentes */}
        <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#111827', margin: 0 }}>Animais Recentes</h3>
            <Link href="/admin/collections/animals" style={{ color: '#1e3a8a', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>Ver todos</Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Animal</th>
                  <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</th>
                  <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Porte</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {animalDocs.slice(0, 5).map((animal: any) => (
                  <tr key={animal.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '0.75rem', background: '#f3f4f6', overflow: 'hidden', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                          {animal.fotos?.[0]?.foto && typeof animal.fotos[0].foto === 'object' && 'url' in animal.fotos[0].foto ? (
                            <img src={animal.fotos[0].foto.url || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                          ) : '🐾'}
                        </div>
                        <div>
                          <p style={{ fontWeight: 800, color: '#111827', margin: 0, fontSize: '0.95rem' }}>{animal.nome}</p>
                          <p style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, margin: 0 }}>
                            {animal.especie} • {animal.idade ? `${animal.idade} anos` : 'N/I'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        ...statusColor(animal.status),
                      }}>
                        {animal.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#6b7280', fontSize: '0.9rem' }}>{animal.porte}</td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <Link
                        href={`/admin/collections/animals/${animal.id}`}
                        style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '1.1rem' }}
                      >
                        →
                      </Link>
                    </td>
                  </tr>
                ))}
                {animalDocs.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' }}>
                      Nenhum animal cadastrado ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Alertas */}
          <div style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#111827', margin: 0 }}>Alertas Importantes</h3>
              <Link href="/admin/collections/adoption-requests" style={{ color: '#1e3a8a', fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none' }}>Ver todos</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pendingCount > 0 && (
                <div style={{ display: 'flex', gap: '0.75rem', padding: '1rem', background: '#fef2f2', borderRadius: '0.75rem', border: '1px solid #fecaca', alignItems: 'center' }}>
                  <div style={{ width: '36px', height: '36px', background: '#dc2626', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1rem', flexShrink: 0 }}>⚠</div>
                  <div>
                    <p style={{ fontWeight: 800, color: '#111827', fontSize: '0.9rem', margin: 0 }}>{pendingCount} pedidos de adoção aguardando análise</p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, marginTop: '0.15rem' }}>Entrevistas pendentes</p>
                  </div>
                  <span style={{ marginLeft: 'auto', background: '#fee2e2', color: '#dc2626', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>Atenção</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', padding: '1rem', background: '#f9fafb', borderRadius: '0.75rem', border: '1px solid #f3f4f6', alignItems: 'center', opacity: 0.6 }}>
                <div style={{ width: '36px', height: '36px', background: '#d1d5db', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '1rem', flexShrink: 0 }}>🩺</div>
                <div>
                  <p style={{ fontWeight: 800, color: '#6b7280', fontSize: '0.9rem', margin: 0, fontStyle: 'italic' }}>Vacinas em dia</p>
                  <p style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>Nenhum alerta para hoje</p>
                </div>
              </div>
            </div>
          </div>

          {/* Atividades Recentes */}
          <div style={{ background: '#111827', borderRadius: '1rem', padding: '1.5rem', color: '#fff', position: 'relative', overflow: 'hidden', flex: 1 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, marginBottom: '1.25rem', margin: '0 0 1.25rem 0' }}>Atividades Recentes</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentEventDocs.map((event: any) => (
                <div key={event.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ width: '32px', height: '32px', background: '#1e3a8a', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>📋</div>
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>{event.tipo}</p>
                    <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: 0 }}>
                      {typeof event.animal === 'object' ? event.animal?.nome : 'Animal'} • {new Date(event.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
              {latestAdoptionDocs.map((request: any) => (
                <div key={request.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ width: '32px', height: '32px', background: '#be185d', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>💜</div>
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>Interesse: {request.nome}</p>
                    <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: 0 }}>
                      {typeof request.animal === 'object' ? request.animal?.nome : 'Adoção'} • {new Date(request.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
              {recentEventDocs.length === 0 && latestAdoptionDocs.length === 0 && (
                <p style={{ fontSize: '0.8rem', color: '#6b7280', fontStyle: 'italic', margin: 0 }}>Nenhuma atividade recente.</p>
              )}
            </div>
          </div>

          {/* Ações Rápidas */}
          <div style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#111827', margin: '0 0 1rem 0' }}>Ações Rápidas</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Link href="/admin/collections/animals/create" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '0.75rem', border: '1px solid #f3f4f6', textDecoration: 'none', color: '#374151', fontWeight: 700, fontSize: '0.8rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🐾</span>
                Novo Resgate
              </Link>
              <Link href="/admin/collections/transactions/create" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '0.75rem', border: '1px solid #f3f4f6', textDecoration: 'none', color: '#374151', fontWeight: 700, fontSize: '0.8rem' }}>
                <span style={{ fontSize: '1.5rem' }}>💰</span>
                Registrar Doação
              </Link>
              <Link href="/admin/collections/animal-events/create" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '0.75rem', border: '1px solid #f3f4f6', textDecoration: 'none', color: '#374151', fontWeight: 700, fontSize: '0.8rem' }}>
                <span style={{ fontSize: '1.5rem' }}>📅</span>
                Novo Evento
              </Link>
              <Link href="/admin/collections/adoption-requests" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '0.75rem', border: '1px solid #f3f4f6', textDecoration: 'none', color: '#374151', fontWeight: 700, fontSize: '0.8rem' }}>
                <span style={{ fontSize: '1.5rem' }}>📝</span>
                Ver Pedidos
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
