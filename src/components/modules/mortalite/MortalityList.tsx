'use client'

import { formatDate, formatNumber } from '@/lib/utils'
import type { MortalityRecord } from '@/types'
import { Skull } from 'lucide-react'

const causeLabel: Record<string, string> = {
  maladie: 'Maladie', accident: 'Accident', inconnu: 'Inconnu', reforme: 'Réforme', autre: 'Autre',
}
const causeBadge: Record<string, string> = {
  maladie: 'badge-red', accident: 'badge-yellow', inconnu: 'badge-gray', reforme: 'badge-blue', autre: 'badge-gray',
}

export function MortalityList({ records }: { records: MortalityRecord[] }) {
  if (records.length === 0) {
    return (
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-12 text-center">
        <Skull size={36} className="text-[var(--muted)] mx-auto mb-3" />
        <p className="text-[var(--foreground)] font-medium mb-1">Aucune mortalité enregistrée</p>
        <p className="text-[var(--muted)] text-sm">Bonne nouvelle ! Cliquez sur « Enregistrer décès » si nécessaire.</p>
      </div>
    )
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl overflow-hidden">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Nombre</th>
            <th>Cause</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td className="font-medium">{formatDate(r.date)}</td>
              <td>
                <span className="font-bold text-[#ef4444]">{r.count}</span>
              </td>
              <td>
                {r.cause ? (
                  <span className={`badge ${causeBadge[r.cause] ?? 'badge-gray'}`}>
                    {causeLabel[r.cause] ?? r.cause}
                  </span>
                ) : '—'}
              </td>
              <td className="text-[var(--muted)] text-xs max-w-xs truncate">{r.description ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
