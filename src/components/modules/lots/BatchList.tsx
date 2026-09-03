'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { formatDate, formatNumber, calcAgeDays } from '@/lib/utils'
import { BatchFormModal } from './BatchFormModal'
import { Pencil, Archive, Eye } from 'lucide-react'
import { toast } from 'sonner'
import type { Batch, BatchSummary, Building, Supplier } from '@/types'
import Link from 'next/link'

interface BatchListProps {
  batches: (Batch & { buildings?: { name: string } | null; suppliers?: { name: string } | null })[]
  summaries: BatchSummary[]
  farmId: string
  buildings: Building[]
  suppliers: Supplier[]
}

export function BatchList({ batches, summaries, farmId, buildings, suppliers }: BatchListProps) {
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const summaryMap = Object.fromEntries(summaries.map((s) => [s.id, s]))

  const statusBadge: Record<string, string> = {
    active: 'badge-green',
    closed: 'badge-gray',
    archived: 'badge-gray',
  }
  const statusLabel: Record<string, string> = {
    active: 'Actif',
    closed: 'Clôturé',
    archived: 'Archivé',
  }

  const handleClose = async (id: string) => {
    if (!confirm('Clôturer ce lot ? Cette action marque le lot comme terminé.')) return
    const { error } = await supabase
      .from('batches')
      .update({ status: 'closed', end_date: new Date().toISOString().split('T')[0] })
      .eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success('Lot clôturé.')
    router.refresh()
  }

  if (batches.length === 0) {
    return (
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-12 text-center">
        <p className="text-[var(--muted)] text-sm mb-2">Aucun lot trouvé</p>
        <p className="text-xs text-[var(--muted)]">Cliquez sur « Nouveau lot » pour démarrer</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Lot</th>
              <th>Mise en place</th>
              <th>Bâtiment</th>
              <th>Initial</th>
              <th>Vivants</th>
              <th>Mortalité</th>
              <th>Age (j)</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => {
              const summary = summaryMap[batch.id]
              return (
                <tr key={batch.id}>
                  <td>
                    <Link
                      href={`/lots/${batch.id}`}
                      className="font-semibold text-[var(--primary)] hover:underline"
                    >
                      {batch.batch_number}
                    </Link>
                    {batch.breed && (
                      <p className="text-xs text-[var(--muted)] mt-0.5">{batch.breed}</p>
                    )}
                  </td>
                  <td className="text-[var(--muted)]">{formatDate(batch.start_date)}</td>
                  <td>{batch.buildings?.name ?? '—'}</td>
                  <td className="font-medium">{formatNumber(batch.initial_count)}</td>
                  <td className="font-medium text-[var(--primary)]">
                    {summary ? formatNumber(summary.current_count) : '—'}
                  </td>
                  <td>
                    {summary ? (
                      <span className={summary.mortality_rate_pct > 5 ? 'text-[#ef4444] font-medium' : 'text-[var(--muted)]'}>
                        {summary.total_mortality} ({summary.mortality_rate_pct}%)
                      </span>
                    ) : '—'}
                  </td>
                  <td className="text-[var(--muted)]">
                    {calcAgeDays(batch.start_date, batch.end_date)} j
                  </td>
                  <td>
                    <span className={`badge ${statusBadge[batch.status]}`}>
                      {statusLabel[batch.status]}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/lots/${batch.id}`}
                        className="p-1.5 rounded text-[var(--muted-fg)] hover:text-[var(--primary)] hover:bg-[var(--primary-muted)] transition-colors"
                        title="Voir détail"
                      >
                        <Eye size={14} />
                      </Link>
                      <button
                        onClick={() => setEditingBatch(batch)}
                        className="p-1.5 rounded text-[var(--muted-fg)] hover:text-[var(--foreground)] hover:bg-[var(--card)] transition-colors"
                        title="Modifier"
                      >
                        <Pencil size={14} />
                      </button>
                      {batch.status === 'active' && (
                        <button
                          onClick={() => handleClose(batch.id)}
                          className="p-1.5 rounded text-[var(--muted-fg)] hover:text-[#f59e0b] hover:bg-[rgba(245,158,11,0.1)] transition-colors"
                          title="Clôturer"
                        >
                          <Archive size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {editingBatch && (
        <BatchFormModal
          farmId={farmId}
          buildings={buildings}
          suppliers={suppliers}
          batch={editingBatch}
          onClose={() => setEditingBatch(null)}
        />
      )}
    </>
  )
}
