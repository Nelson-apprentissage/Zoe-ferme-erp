'use client'
import { formatDate, formatCurrency } from '@/lib/utils'
import { CreditCard, AlertCircle } from 'lucide-react'

const methodLabel: Record<string, string> = { especes: 'Espèces', mobile_money: 'Mobile Money', virement: 'Virement', cheque: 'Chèque', autre: 'Autre' }

export function PaiementsList({ payments, balances }: { payments: any[], balances: any[] }) {
  return (
    <div className="space-y-6">
      {/* Créances */}
      {balances.length > 0 && (
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--card-border)] flex items-center gap-2">
            <AlertCircle size={14} className="text-[#ef4444]" />
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Clients avec solde impayé</h3>
          </div>
          <table className="data-table">
            <thead><tr><th>Client</th><th className="text-right">Facturé</th><th className="text-right">Payé</th><th className="text-right">Reste dû</th></tr></thead>
            <tbody>
              {balances.map(b => (
                <tr key={b.customer_id}>
                  <td className="font-medium">{b.customer_name}</td>
                  <td className="text-right text-[var(--muted)]">{formatCurrency(b.total_invoiced)}</td>
                  <td className="text-right text-[var(--primary)]">{formatCurrency(b.total_paid)}</td>
                  <td className="text-right font-bold text-[#ef4444]">{formatCurrency(b.balance_due)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Historique paiements */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--card-border)]">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Historique des paiements</h3>
        </div>
        {payments.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard size={36} className="text-[var(--muted)] mx-auto mb-3" />
            <p className="text-[var(--muted)] text-sm">Aucun paiement enregistré.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Date</th><th>Client</th><th>Mode</th><th>Référence</th><th className="text-right">Montant</th></tr></thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id}>
                  <td className="text-[var(--muted)]">{formatDate(p.date)}</td>
                  <td className="font-medium">{p.customers?.name ?? '—'}</td>
                  <td><span className="badge badge-blue">{methodLabel[p.method] ?? p.method}</span></td>
                  <td className="text-[var(--muted)] text-sm">{p.reference ?? '—'}</td>
                  <td className="text-right font-bold text-[var(--primary)]">{formatCurrency(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
