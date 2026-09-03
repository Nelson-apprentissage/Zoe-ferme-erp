'use client'

import { formatDate, formatCurrency } from '@/lib/utils'
import { Receipt } from 'lucide-react'

interface Expense {
  id: string
  date: string
  description: string
  amount: number
  expense_categories: { name: string; color: string } | null
  suppliers: { name: string } | null
}

export function DepensesList({ expenses }: { expenses: Expense[] }) {
  if (expenses.length === 0) {
    return (
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-12 text-center">
        <Receipt size={36} className="text-[var(--muted)] mx-auto mb-3" />
        <p className="text-[var(--foreground)] font-medium mb-1">Aucune dépense enregistrée</p>
        <p className="text-[var(--muted)] text-sm">Cliquez sur « Nouvelle dépense » pour commencer.</p>
      </div>
    )
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl overflow-hidden">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Catégorie</th>
            <th>Fournisseur</th>
            <th className="text-right">Montant</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e.id}>
              <td className="text-[var(--muted)]">{formatDate(e.date)}</td>
              <td className="font-medium">{e.description}</td>
              <td>
                {e.expense_categories ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: e.expense_categories.color }} />
                    <span className="text-sm">{e.expense_categories.name}</span>
                  </span>
                ) : '—'}
              </td>
              <td className="text-[var(--muted)]">{e.suppliers?.name ?? '—'}</td>
              <td className="text-right font-semibold text-[#ef4444]">{formatCurrency(e.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
