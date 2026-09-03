'use client'

import { formatDate, formatNumber } from '@/lib/utils'
import type { DailyRecord } from '@/types'
import { CalendarDays } from 'lucide-react'

interface DailyRecordListProps {
  records: DailyRecord[]
  batch: { id: string; batch_number: string; initial_count: number; start_date: string }
  batches: { id: string; batch_number: string }[]
}

export function DailyRecordList({ records, batch }: DailyRecordListProps) {
  if (records.length === 0) {
    return (
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-12 text-center">
        <CalendarDays size={36} className="text-[var(--muted)] mx-auto mb-3" />
        <p className="text-[var(--foreground)] font-medium mb-1">Aucune saisie pour le lot {batch.batch_number}</p>
        <p className="text-[var(--muted)] text-sm">Cliquez sur « Saisie du jour » pour commencer le suivi.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <span>Lot actif :</span>
        <span className="font-semibold text-[var(--primary)]">{batch.batch_number}</span>
        <span>— {formatNumber(batch.initial_count)} sujets initiaux</span>
      </div>

      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Effectif vivant</th>
              <th>Eau (L)</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => (
              <tr key={rec.id}>
                <td className="font-medium">{formatDate(rec.date)}</td>
                <td>
                  <span className="font-semibold text-[var(--primary)]">{formatNumber(rec.living_count)}</span>
                  <span className="text-xs text-[var(--muted)] ml-1">
                    ({Math.round((rec.living_count / batch.initial_count) * 100)}%)
                  </span>
                </td>
                <td className="text-[var(--muted)]">
                  {rec.water_consumption_l ? formatNumber(rec.water_consumption_l, 1) : '—'}
                </td>
                <td className="text-[var(--muted)] text-xs max-w-xs truncate">
                  {rec.notes ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
