'use client'

import { formatDate, formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'

interface Sale {
  id: string
  date: string
  status: string
  total_amount: number
  customers: { name: string } | null
}

export function RecentActivity({ sales }: { sales: Sale[] }) {
  const statusLabel: Record<string, { label: string; className: string }> = {
    paid: { label: 'Payé', className: 'badge-green' },
    partial: { label: 'Partiel', className: 'badge-yellow' },
    pending: { label: 'En attente', className: 'badge-red' },
    cancelled: { label: 'Annulé', className: 'badge-gray' },
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Ventes récentes</h3>
        <Link href="/ventes" className="text-xs text-[var(--primary)] hover:underline">
          Voir tout →
        </Link>
      </div>

      {sales.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <ShoppingCart size={32} className="text-[var(--muted)] mb-2" />
          <p className="text-sm text-[var(--muted)]">Aucune vente enregistrée</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Date</th>
              <th>Montant</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => {
              const status = statusLabel[sale.status] ?? { label: sale.status, className: 'badge-gray' }
              return (
                <tr key={sale.id}>
                  <td className="font-medium">{sale.customers?.name ?? '—'}</td>
                  <td className="text-[var(--muted)]">{formatDate(sale.date)}</td>
                  <td className="font-semibold">{formatCurrency(sale.total_amount)}</td>
                  <td>
                    <span className={`badge ${status.className}`}>{status.label}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
