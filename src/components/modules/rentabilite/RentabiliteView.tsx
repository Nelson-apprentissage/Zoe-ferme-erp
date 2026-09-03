'use client'

import { formatCurrency, formatNumber } from '@/lib/utils'
import type { BatchFinancials, BatchZootechnical } from '@/types'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface RentabiliteViewProps {
  financials: BatchFinancials[]
  zootechnical: BatchZootechnical[]
  batches: { id: string; batch_number: string; status: string; start_date: string }[]
}

export function RentabiliteView({ financials, zootechnical }: RentabiliteViewProps) {
  if (financials.length === 0) {
    return (
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-12 text-center">
        <p className="text-[var(--muted)] text-sm">Aucune donnée financière disponible. Créez un lot et enregistrez des ventes.</p>
      </div>
    )
  }

  const zooMap = Object.fromEntries(zootechnical.map(z => [z.id, z]))

  const chartData = financials.map(f => ({
    lot: `Lot ${f.batch_number}`,
    'Coût total': f.total_cost,
    'Recettes': f.total_revenue,
    'Marge': f.gross_margin,
  }))

  return (
    <div className="space-y-6">
      {/* Graphique global */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Coûts vs Recettes par lot (FCFA)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} barSize={24} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
            <XAxis dataKey="lot" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 8 }}
              formatter={(val: number) => [formatCurrency(val), '']}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Coût total" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.8} />
            <Bar dataKey="Recettes" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Marge" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cartes par lot */}
      {financials.map((f) => {
        const zoo = zooMap[f.id]
        const isProfit = f.gross_margin >= 0
        return (
          <div key={f.id} className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl overflow-hidden">
            {/* En-tête */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--card-border)]">
              <div>
                <h4 className="font-semibold text-[var(--foreground)]">Lot {f.batch_number}</h4>
                <p className="text-xs text-[var(--muted)]">Mise en place : {f.start_date}</p>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${isProfit ? 'bg-[rgba(34,197,94,0.1)]' : 'bg-[rgba(239,68,68,0.1)]'}`}>
                {isProfit ? <TrendingUp size={14} className="text-[#22c55e]" /> : <TrendingDown size={14} className="text-[#ef4444]" />}
                <span className={`text-sm font-bold ${isProfit ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                  {isProfit ? '+' : ''}{formatCurrency(f.gross_margin)}
                </span>
              </div>
            </div>

            {/* Données financières */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-[var(--card-border)]">
              {[
                { label: 'Coût poussins', value: formatCurrency(f.total_chick_cost), color: '' },
                { label: 'Coût aliment', value: formatCurrency(f.total_feed_cost), color: '' },
                { label: 'Autres dépenses', value: formatCurrency(f.total_other_expenses), color: '' },
                { label: 'Coût total', value: formatCurrency(f.total_cost), color: 'text-[#ef4444]' },
              ].map((item) => (
                <div key={item.label} className="p-4 text-center">
                  <p className="text-xs text-[var(--muted)] mb-1">{item.label}</p>
                  <p className={`font-semibold ${item.color || 'text-[var(--foreground)]'}`}>{item.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-[var(--card-border)] border-t border-[var(--card-border)]">
              {[
                { label: 'Recettes totales', value: formatCurrency(f.total_revenue), color: 'text-[#22c55e]' },
                { label: 'Encaissé', value: formatCurrency(f.total_paid), color: '' },
                { label: 'Créances', value: formatCurrency(f.total_receivable), color: f.total_receivable > 0 ? 'text-[#f59e0b]' : '' },
                { label: 'Coût/kg', value: f.cost_per_kg ? `${formatNumber(f.cost_per_kg)} FCFA/kg` : '—', color: '' },
              ].map((item) => (
                <div key={item.label} className="p-4 text-center">
                  <p className="text-xs text-[var(--muted)] mb-1">{item.label}</p>
                  <p className={`font-semibold ${item.color || 'text-[var(--foreground)]'}`}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Données zootechniques */}
            {zoo && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-[var(--card-border)] border-t border-[var(--card-border)] bg-[var(--input-bg)]">
                {[
                  { label: 'Âge (j)', value: zoo.age_days },
                  { label: 'Mortalité', value: `${zoo.total_mortality} (${zoo.mortality_rate_pct}%)` },
                  { label: 'Poids moy. (g)', value: zoo.last_avg_weight_g ? formatNumber(zoo.last_avg_weight_g) : '—' },
                  { label: 'IC', value: zoo.feed_conversion_ratio ?? '—' },
                ].map((item) => (
                  <div key={item.label} className="p-3 text-center">
                    <p className="text-[10px] text-[var(--muted)] mb-0.5">{item.label}</p>
                    <p className="text-sm font-medium text-[var(--foreground)]">{item.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
