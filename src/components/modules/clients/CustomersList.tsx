'use client'

import { formatCurrency } from '@/lib/utils'
import type { Customer, CustomerBalance } from '@/types'
import { Users, Phone, MapPin } from 'lucide-react'

const typeLabel: Record<string, string> = {
  particulier: 'Particulier', revendeur: 'Revendeur',
  restaurant: 'Restaurant', autre: 'Autre',
}
const typeBadge: Record<string, string> = {
  particulier: 'badge-blue', revendeur: 'badge-yellow',
  restaurant: 'badge-green', autre: 'badge-gray',
}

interface CustomersListProps {
  customers: Customer[]
  balances: CustomerBalance[]
}

export function CustomersList({ customers, balances }: CustomersListProps) {
  const balanceMap = Object.fromEntries(balances.map(b => [b.customer_id, b]))

  if (customers.length === 0) {
    return (
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-12 text-center">
        <Users size={36} className="text-[var(--muted)] mx-auto mb-3" />
        <p className="text-[var(--foreground)] font-medium mb-1">Aucun client enregistré</p>
        <p className="text-[var(--muted)] text-sm">Cliquez sur « Nouveau client » pour commencer.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {customers.map((c) => {
        const bal = balanceMap[c.id]
        const hasDebt = bal && bal.balance_due > 0
        return (
          <div key={c.id} className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4 hover:border-[var(--primary)] transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">{c.name}</h3>
                <span className={`badge ${typeBadge[c.customer_type]}`}>{typeLabel[c.customer_type]}</span>
              </div>
              {hasDebt && (
                <div className="text-right">
                  <p className="text-xs text-[var(--muted)]">Doit</p>
                  <p className="text-sm font-bold text-[#ef4444]">{formatCurrency(bal.balance_due)}</p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              {c.phone && (
                <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                  <Phone size={12} />
                  <span>{c.phone}</span>
                </div>
              )}
              {c.address && (
                <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                  <MapPin size={12} />
                  <span>{c.address}</span>
                </div>
              )}
            </div>

            {bal && (
              <div className="mt-3 pt-3 border-t border-[var(--card-border)] grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] text-[var(--muted)]">Total facturé</p>
                  <p className="text-sm font-medium text-[var(--foreground)]">{formatCurrency(bal.total_invoiced)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--muted)]">Total payé</p>
                  <p className="text-sm font-medium text-[var(--primary)]">{formatCurrency(bal.total_paid)}</p>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
