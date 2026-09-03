'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend
} from 'recharts'
import type { BatchSummary } from '@/types'

interface DashboardChartsProps {
  batches: BatchSummary[]
}

export function DashboardCharts({ batches }: DashboardChartsProps) {
  const mortalityData = batches.map((b) => ({
    lot: `Lot ${b.batch_number}`,
    morts: b.total_mortality,
    vivants: b.current_count,
    taux: b.mortality_rate_pct,
  }))

  const effectifData = batches.map((b) => ({
    lot: `Lot ${b.batch_number}`,
    initial: b.initial_count,
    actuel: b.current_count,
    vendus: b.total_sold,
  }))

  if (batches.length === 0) {
    return (
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 flex items-center justify-center h-64">
        <p className="text-[var(--muted)] text-sm">Aucun lot actif — créez votre premier lot</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Effectifs par lot */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
          Effectifs par lot
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={effectifData} barSize={20} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
            <XAxis dataKey="lot" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 8 }}
              labelStyle={{ color: 'var(--foreground)', fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="initial" name="Initial" fill="#3b82f6" radius={[4, 4, 0, 0]} opacity={0.5} />
            <Bar dataKey="actuel" name="Vivants" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="vendus" name="Vendus" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Taux de mortalité */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
          Taux de mortalité (%)
        </h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={mortalityData} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
            <XAxis dataKey="lot" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip
              contentStyle={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 8 }}
              formatter={(val: number) => [`${val}%`, 'Taux mortalité']}
            />
            <Bar dataKey="taux" name="Mortalité %" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
