'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { formatDate, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { CreditCard, Plus, X, Loader2 } from 'lucide-react'
import type { Customer } from '@/types'

interface Sale {
  id: string
  date: string
  status: string
  total_amount: number
  notes?: string
  customers: { name: string } | null
  batches: { batch_number: string } | null
  sale_items: { quantity: number; total_price: number; unit_weight_kg?: number }[]
  payments: { amount: number }[]
}

interface SalesListProps {
  sales: Sale[]
  customers: Customer[]
  batches: { id: string; batch_number: string }[]
}

const statusInfo: Record<string, { label: string; className: string }> = {
  paid: { label: 'Payé', className: 'badge-green' },
  partial: { label: 'Partiel', className: 'badge-yellow' },
  pending: { label: 'En attente', className: 'badge-red' },
  cancelled: { label: 'Annulé', className: 'badge-gray' },
}

export function SalesList({ sales }: SalesListProps) {
  const [payingId, setPayingId] = useState<string | null>(null)
  const [payForm, setPayForm] = useState({ amount: '', method: 'especes', reference: '', date: new Date().toISOString().split('T')[0] })
  const [payLoading, setPayLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handlePayment = async (sale: Sale) => {
    setPayLoading(true)
    const paid = sale.payments.reduce((a, p) => a + p.amount, 0)
    const remaining = sale.total_amount - paid
    const amount = Number(payForm.amount)
    if (!amount || amount <= 0 || amount > remaining) {
      toast.error(`Montant invalide. Restant dû : ${formatCurrency(remaining)}`)
      setPayLoading(false); return
    }

    const newPaid = paid + amount
    const newStatus = newPaid >= sale.total_amount ? 'paid' : 'partial'

    const [{ error: payErr }] = await Promise.all([
      supabase.from('payments').insert({
        sale_id: sale.id,
        customer_id: sale.customers ? (sales.find(s => s.id === sale.id) as any)?.customer_id : null,
        date: payForm.date,
        amount,
        method: payForm.method,
        reference: payForm.reference || null,
      }),
    ])
    if (payErr) { toast.error(payErr.message); setPayLoading(false); return }

    await supabase.from('sales').update({ status: newStatus }).eq('id', sale.id)
    toast.success('Paiement enregistré !')
    router.refresh()
    setPayingId(null)
    setPayLoading(false)
  }

  if (sales.length === 0) {
    return (
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-12 text-center">
        <CreditCard size={36} className="text-[var(--muted)] mx-auto mb-3" />
        <p className="text-[var(--foreground)] font-medium mb-1">Aucune vente enregistrée</p>
        <p className="text-[var(--muted)] text-sm">Cliquez sur « Nouvelle vente » pour commencer.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sales.map((sale) => {
        const totalPaid = sale.payments.reduce((a, p) => a + p.amount, 0)
        const remaining = sale.total_amount - totalPaid
        const totalQty = sale.sale_items.reduce((a, i) => a + i.quantity, 0)
        const status = statusInfo[sale.status] ?? { label: sale.status, className: 'badge-gray' }
        const isPaying = payingId === sale.id

        return (
          <div key={sale.id} className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl overflow-hidden">
            {/* Ligne principale */}
            <div className="flex items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-[var(--foreground)]">{sale.customers?.name ?? '—'}</p>
                  <span className={`badge ${status.className}`}>{status.label}</span>
                </div>
                <p className="text-xs text-[var(--muted)]">
                  {sale.batches ? `Lot ${sale.batches.batch_number}` : ''} • {formatDate(sale.date)} • {totalQty} sujet(s)
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-[var(--foreground)]">{formatCurrency(sale.total_amount)}</p>
                {remaining > 0 && (
                  <p className="text-xs text-[#ef4444]">Reste : {formatCurrency(remaining)}</p>
                )}
              </div>

              {remaining > 0 && sale.status !== 'cancelled' && (
                <button
                  onClick={() => { setPayingId(isPaying ? null : sale.id); setPayForm({ amount: String(remaining), method: 'especes', reference: '', date: new Date().toISOString().split('T')[0] }) }}
                  className="btn btn-secondary text-xs"
                  id={`pay-sale-${sale.id}`}
                >
                  <Plus size={14} /> Paiement
                </button>
              )}
            </div>

            {/* Formulaire paiement inline */}
            {isPaying && (
              <div className="border-t border-[var(--card-border)] bg-[var(--input-bg)] p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1">Montant (FCFA) *</label>
                    <input type="number" value={payForm.amount}
                      onChange={(e) => setPayForm(p => ({ ...p, amount: e.target.value }))}
                      min={1} max={remaining} className="input text-sm" id={`pay-amount-${sale.id}`} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1">Mode</label>
                    <select value={payForm.method}
                      onChange={(e) => setPayForm(p => ({ ...p, method: e.target.value }))}
                      className="input text-sm" id={`pay-method-${sale.id}`}>
                      <option value="especes">Espèces</option>
                      <option value="mobile_money">Mobile Money</option>
                      <option value="virement">Virement</option>
                      <option value="cheque">Chèque</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1">Référence</label>
                    <input type="text" value={payForm.reference}
                      onChange={(e) => setPayForm(p => ({ ...p, reference: e.target.value }))}
                      placeholder="N° transaction..." className="input text-sm" id={`pay-ref-${sale.id}`} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1">Date</label>
                    <input type="date" value={payForm.date}
                      onChange={(e) => setPayForm(p => ({ ...p, date: e.target.value }))}
                      className="input text-sm" id={`pay-date-${sale.id}`} />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setPayingId(null)} className="btn btn-secondary text-xs">
                    <X size={12} /> Annuler
                  </button>
                  <button onClick={() => handlePayment(sale)} disabled={payLoading} className="btn btn-primary text-xs">
                    {payLoading ? <><Loader2 size={12} className="animate-spin" /> Enregistrement...</> : '✓ Confirmer le paiement'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
