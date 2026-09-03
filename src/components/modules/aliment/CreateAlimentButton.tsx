'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, X, Loader2, ShoppingCart, BarChart2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate, formatCurrency } from '@/lib/utils'

interface FeedProduct { id: string; name: string; unit: string }
interface Batch { id: string; batch_number: string }

interface CreateAlimentButtonProps {
  farmId: string
  feedProducts: FeedProduct[]
  batches: Batch[]
}

export function CreateAlimentButton({ farmId, feedProducts, batches }: CreateAlimentButtonProps) {
  const [modal, setModal] = useState<'purchase' | 'none'>('none')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [purchaseForm, setPurchaseForm] = useState({
    product_id: feedProducts[0]?.id ?? '',
    date: new Date().toISOString().split('T')[0],
    quantity_kg: '',
    unit_price: '',
    supplier_name: '',
  })

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const qty = Number(purchaseForm.quantity_kg)
    const price = Number(purchaseForm.unit_price)
    const { error } = await supabase.from('feed_purchases').insert({
      farm_id: farmId,
      product_id: purchaseForm.product_id,
      date: purchaseForm.date,
      quantity_kg: qty,
      unit_price: price || null,
      total_cost: price ? qty * price : null,
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success('Achat enregistré !')
    router.refresh(); setModal('none'); setLoading(false)
  }

  return (
    <>
      <button onClick={() => setModal('purchase')} className="btn btn-primary" id="create-feed-purchase-btn">
        <Plus size={16} /> Achat aliment
      </button>

      {modal === 'purchase' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--card-border)]">
              <h2 className="text-base font-semibold text-[var(--foreground)] flex items-center gap-2">
                <ShoppingCart size={16} /> Achat aliment
              </h2>
              <button onClick={() => setModal('none')} className="text-[var(--muted)] hover:text-[var(--foreground)]"><X size={18} /></button>
            </div>
            <form onSubmit={handlePurchase} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Produit *</label>
                <select value={purchaseForm.product_id}
                  onChange={e => setPurchaseForm(p => ({ ...p, product_id: e.target.value }))}
                  required className="input" id="feed-product">
                  {feedProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Date *</label>
                  <input type="date" value={purchaseForm.date}
                    onChange={e => setPurchaseForm(p => ({ ...p, date: e.target.value }))}
                    required className="input" id="feed-date" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Quantité (kg) *</label>
                  <input type="number" value={purchaseForm.quantity_kg} min={1} step="0.1"
                    onChange={e => setPurchaseForm(p => ({ ...p, quantity_kg: e.target.value }))}
                    placeholder="ex: 100" required className="input" id="feed-qty" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Prix/kg (FCFA)</label>
                  <input type="number" value={purchaseForm.unit_price} min={0}
                    onChange={e => setPurchaseForm(p => ({ ...p, unit_price: e.target.value }))}
                    placeholder="ex: 250" className="input" id="feed-price" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Total</label>
                  <div className="input bg-[var(--input-bg)] text-[var(--primary)] font-bold">
                    {purchaseForm.quantity_kg && purchaseForm.unit_price
                      ? (Number(purchaseForm.quantity_kg) * Number(purchaseForm.unit_price)).toLocaleString('fr-FR') + ' FCFA'
                      : '—'}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal('none')} className="btn btn-secondary flex-1">Annuler</button>
                <button type="submit" disabled={loading} className="btn btn-primary flex-1 justify-center">
                  {loading ? <><Loader2 size={14} className="animate-spin" /> Enregistrement...</> : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
