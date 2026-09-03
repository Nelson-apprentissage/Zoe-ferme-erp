'use client'
import { Package } from 'lucide-react'

export function StocksList({ stocks, alerts }: { stocks: any[], alerts: any[] }) {
  const alertIds = new Set(alerts.map(a => a.id))
  if (stocks.length === 0) return (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-12 text-center">
      <Package size={36} className="text-[var(--muted)] mx-auto mb-3" />
      <p className="text-[var(--foreground)] font-medium mb-1">Aucun article en stock</p>
      <p className="text-[var(--muted)] text-sm">Les stocks seront affichés ici après configuration dans Supabase.</p>
    </div>
  )
  return (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl overflow-hidden">
      <table className="data-table">
        <thead><tr><th>Article</th><th>Catégorie</th><th>Quantité</th><th>Unité</th><th>Seuil min</th><th>Statut</th></tr></thead>
        <tbody>
          {stocks.map(s => {
            const isAlert = alertIds.has(s.id)
            return (
              <tr key={s.id}>
                <td className="font-medium">{s.name}</td>
                <td>
                  {s.stock_categories ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: s.stock_categories.color }} />
                      {s.stock_categories.name}
                    </span>
                  ) : '—'}
                </td>
                <td className={`font-bold ${isAlert ? 'text-[#ef4444]' : 'text-[var(--primary)]'}`}>{s.current_quantity}</td>
                <td className="text-[var(--muted)]">{s.unit}</td>
                <td className="text-[var(--muted)]">{s.min_quantity ?? '—'}</td>
                <td><span className={`badge ${isAlert ? 'badge-red' : 'badge-green'}`}>{isAlert ? 'Alerte' : 'OK'}</span></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
