'use client'

import { formatDate, formatNumber } from '@/lib/utils'
import { Scale } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface WeightRecord {
  id: string; date: string; sample_size?: number
  avg_weight_g: number; min_weight_g?: number; max_weight_g?: number; notes?: string
}

export function PoidsView({ records, batch }: { records: WeightRecord[]; batch: { batch_number: string; start_date: string } }) {
  const chartData = records.map(r => ({
    date: r.date,
    'Poids moyen (g)': r.avg_weight_g,
    'Min': r.min_weight_g,
    'Max': r.max_weight_g,
  }))

  return (
    <div className="space-y-6">
      {/* Courbe de croissance */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Courbe de croissance — Lot {batch.batch_number}</h3>
        {records.length < 2 ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-sm text-[var(--muted)]">Enregistrez au moins 2 pesées pour afficher la courbe.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} unit="g" />
              <Tooltip
                contentStyle={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 8 }}
                formatter={(v: number) => [`${formatNumber(v)} g`, '']}
              />
              <Line type="monotone" dataKey="Min" stroke="#94a3b8" strokeDasharray="4 2" dot={false} strokeWidth={1} />
              <Line type="monotone" dataKey="Max" stroke="#94a3b8" strokeDasharray="4 2" dot={false} strokeWidth={1} />
              <Line type="monotone" dataKey="Poids moyen (g)" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: '#22c55e', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Tableau des pesées */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl overflow-hidden">
        {records.length === 0 ? (
          <div className="p-12 text-center">
            <Scale size={36} className="text-[var(--muted)] mx-auto mb-3" />
            <p className="text-[var(--foreground)] font-medium mb-1">Aucune pesée enregistrée</p>
            <p className="text-[var(--muted)] text-sm">Cliquez sur « Nouvelle pesée » pour commencer.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Âge (j)</th>
                <th>Effectif pesé</th>
                <th>Poids moyen (g)</th>
                <th>Min / Max (g)</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {[...records].reverse().map(r => {
                const ageDays = Math.floor((new Date(r.date).getTime() - new Date(batch.start_date).getTime()) / 86400000)
                return (
                  <tr key={r.id}>
                    <td className="text-[var(--muted)]">{formatDate(r.date)}</td>
                    <td className="text-[var(--muted)]">J+{ageDays}</td>
                    <td>{r.sample_size ?? '—'}</td>
                    <td><span className="font-bold text-[var(--primary)]">{formatNumber(r.avg_weight_g)} g</span></td>
                    <td className="text-[var(--muted)] text-sm">
                      {r.min_weight_g && r.max_weight_g ? `${r.min_weight_g} / ${r.max_weight_g}` : '—'}
                    </td>
                    <td className="text-[var(--muted)] text-xs">{r.notes ?? '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
