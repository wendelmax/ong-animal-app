import { getPayload } from 'payload'
import config from '@/payload.config'
import React from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  BarChart3, 
  Receipt, 
  Info,
  ShieldCheck,
  Heart
} from 'lucide-react'

export const metadata = {
  title: 'Transparência Financeira | Viralatinhas Sumaré',
  description: 'Confira nossa prestação de contas, doações recebidas e como investimos cada real no bem-estar animal.',
}

export default async function TransparencyPage() {
  const payload = await getPayload({ config })

  // Fetch Transactions for the current month (simplified for now)
  const { docs: transactions } = await payload.find({
    collection: 'transactions',
    limit: 100,
    sort: '-data',
  })

  // Basic Aggregation
  const totalIncome = transactions
    .filter(t => t.tipo === 'Receita' || t.tipo === 'Doação')
    .reduce((acc, t) => acc + (t.valor || 0), 0)

  const totalExpense = transactions
    .filter(t => t.tipo === 'Despesa')
    .reduce((acc, t) => acc + (t.valor || 0), 0)

  const balance = totalIncome - totalExpense

  return (
    <div className="min-h-screen bg-zinc-50 pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-black mb-6 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" /> Prestação de Contas Aberta
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tighter mb-6">
            Transparência com <br />
            <span className="text-brand-blue">cada centavo.</span>
          </h1>
          <p className="text-xl text-zinc-600 max-w-2xl mx-auto font-medium">
            Toda doação recebida é transformada diretamente em saúde e dignidade para os animais de Sumaré.
          </p>
        </div>

        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-20 h-20 text-emerald-500" />
            </div>
            <p className="text-zinc-400 font-black uppercase text-xs tracking-widest mb-2">Total Arrecadado</p>
            <h2 className="text-5xl font-black text-emerald-600 tracking-tighter">
              R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
            <p className="text-zinc-500 text-sm mt-4 font-bold">Doações e eventos recentes</p>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <TrendingDown className="w-20 h-20 text-brand-magenta" />
            </div>
            <p className="text-zinc-400 font-black uppercase text-xs tracking-widest mb-2">Total em Despesas</p>
            <h2 className="text-5xl font-black text-brand-magenta tracking-tighter">
              R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
            <p className="text-zinc-500 text-sm mt-4 font-bold">Ração, médicos e clínicas</p>
          </div>

          <div className="bg-brand-blue p-10 rounded-[2.5rem] text-white shadow-2xl shadow-brand-blue/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
              <PieChart className="w-20 h-20 text-white" />
            </div>
            <p className="text-white/60 font-black uppercase text-xs tracking-widest mb-2">Saldo em Caixa</p>
            <h2 className="text-5xl font-black text-white tracking-tighter">
              R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
            <p className="text-white/80 text-sm mt-4 font-bold">Recurso para novos resgates</p>
          </div>
        </div>

        {/* Detailed Transactions List */}
        <div className="bg-white rounded-[3rem] border border-zinc-100 overflow-hidden">
          <div className="p-12 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-6">
            <div>
              <h3 className="text-3xl font-black text-zinc-900 mb-2">Histórico Recente</h3>
              <p className="text-zinc-500 font-medium">Listagem detalhada das últimas movimentações financeiras</p>
            </div>
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-zinc-100 text-zinc-600 font-bold rounded-xl flex items-center gap-2 hover:bg-zinc-200 transition-all">
                <BarChart3 className="w-5 h-5" /> Relatório Completo
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/50">
                  <th className="px-12 py-6 text-xs font-black text-zinc-400 uppercase tracking-widest">Data</th>
                  <th className="px-6 py-6 text-xs font-black text-zinc-400 uppercase tracking-widest">Descrição</th>
                  <th className="px-6 py-6 text-xs font-black text-zinc-400 uppercase tracking-widest">Categoria</th>
                  <th className="px-6 py-6 text-xs font-black text-zinc-400 uppercase tracking-widest">Animal</th>
                  <th className="px-12 py-6 text-right text-xs font-black text-zinc-400 uppercase tracking-widest">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {transactions.length > 0 ? (
                  transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-zinc-50/50 transition-colors group">
                      <td className="px-12 py-8 text-zinc-500 font-bold text-sm">
                        {new Date(t.data).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-8">
                        <div className="font-black text-zinc-900 group-hover:text-brand-blue transition-colors">
                          {t.descricao}
                        </div>
                      </td>
                      <td className="px-6 py-8">
                        <span className="px-3 py-1 bg-zinc-100 text-zinc-600 text-[10px] font-black uppercase tracking-widest rounded-md">
                          {t.categoria || 'Outros'}
                        </span>
                      </td>
                      <td className="px-6 py-8">
                        {t.animal && typeof t.animal === 'object' && 'nome' in t.animal ? (
                          <div className="flex items-center gap-2 text-zinc-500 font-bold text-sm">
                            <Heart className="w-4 h-4 text-brand-magenta fill-current" /> {t.animal.nome}
                          </div>
                        ) : (
                          <span className="text-zinc-300">—</span>
                        )}
                      </td>
                      <td className={`px-12 py-8 text-right font-black text-lg ${t.tipo === 'Receita' || t.tipo === 'Doação' ? 'text-emerald-600' : 'text-brand-magenta'}`}>
                        {t.tipo === 'Despesa' ? '-' : '+'} R$ {t.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-12 py-20 text-center">
                      <Receipt className="w-16 h-16 text-zinc-100 mx-auto mb-4" />
                      <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">Nenhuma transação registrada recentemente.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-16 bg-brand-orange/10 rounded-[3rem] p-12 flex flex-col md:flex-row items-center gap-10">
          <div className="w-20 h-20 bg-brand-orange text-white rounded-3xl flex items-center justify-center flex-shrink-0">
            <Info className="w-10 h-10" />
          </div>
          <div className="flex-1">
            <h4 className="text-2xl font-black text-zinc-900 mb-2">Por que somos transparentes?</h4>
            <p className="text-zinc-600 font-medium leading-relaxed">
              Como uma organização mantida exclusivamente por doações, acreditamos que a transparência é a base da nossa relação com a comunidade. 
              Aqui, você acompanha cada real investido na castração, alimentação e cuidados médicos dos nossos resgatados.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
