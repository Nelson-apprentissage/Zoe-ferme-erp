'use client'

import { useState } from 'react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { ShoppingCart, BarChart2 } from 'lucide-react'

interface AlimentListProps {
  feedPurchases: any[]
  consumption: any[]
  feedProducts: any[]
}

export function AlimentList({ feedPurchases, consumption, feedProducts }: AlimentListProps) {
  const [tab, setTab] = useState<'achats' | 'conso'>('achats')

  return (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-[var(--card-border)]">
        {[
          { key: 'achats', label: 'Achats', icon: ShoppingCart },
          { key: 'conso', label: 'Consommation', icon: BarChart2 },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.key
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Achats */}
      {tab === 'achats' && (
        feedPurchases.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart size={32} className="text-[var(--muted)] mx-auto mb-3" />
            <p className="text-[var(--muted)] text-sm">Aucun achat enregistré. Cliquez sur « Achat aliment ».</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Prix/kg</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {feedPurchases.map(p => (
                <tr key={p.id}>
                  <td className="text-[var(--muted)]">{formatDate(p.date)}</td>
                  <td className="font-medium">{p.feed_products?.name ?? '—'}</td>
                  <td>{p.quantity_kg} kg</td>
                  <td className="text-[var(--muted)]">{p.unit_price ? formatCurrency(p.unit_price) + '/kg' : '—'}</td>
                  <td className="text-right font-semibold text-[var(--primary)]">
                    {p.total_cost ? formatCurrency(p.total_cost) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}

      {/* Consommation */}
      {tab === 'conso' && (
        consumption.length === 0 ? (
          <div className="p-12 text-center">
            <BarChart2 size={32} className="text-[var(--muted)] mx-auto mb-3" />
            <p className="text-[var(--muted)] text-sm">Aucune consommation enregistrée. Saisissez via « Suivi Quotidien ».</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Lot</th>
                <th>Produit</th>
                <th className="text-right">Quantité (kg)</th>
              </tr>
            </thead>
            <tbody>
              {consumption.map(c => (
                <tr key={c.id}>
                  <td className="text-[var(--muted)]">{formatDate(c.date)}</td>
                  <td>{c.batches?.batch_number ?? '—'}</td>
                  <td className="font-medium">{c.feed_products?.name ?? '—'}</td>
                  <td className="text-right font-semibold text-[#f59e0b]">{c.quantity_kg} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </div>
  )
}
