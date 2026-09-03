'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, X, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Customer } from '@/types'

interface SaleItemEntry {
  quantity: number
  unit_weight_kg: string
  unit_price: number
  description: string
}

interface CreateSaleButtonProps {
  batches: { id: string; batch_number: string }[]
  customers: Customer[]
}

export function CreateSaleButton({ batches, customers }: CreateSaleButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    batch_id: batches[0]?.id ?? '',
    customer_id: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  const [items, setItems] = useState<SaleItemEntry[]>([
    { quantity: 1, unit_weight_kg: '', unit_price: 0, description: 'Poulet de chair' },
  ])

  const addItem = () => setItems(p => [...p, { quantity: 1, unit_weight_kg: '', unit_price: 0, description: 'Poulet de chair' }])
  const removeItem = (i: number) => setItems(p => p.filter((_, idx) => idx !== i))
  const updateItem = (i: number, field: keyof SaleItemEntry, value: string | number) =>
    setItems(p => p.map((item, idx) => idx === i ? { ...item, [field]: value } : item))

  const calcItemTotal = (item: SaleItemEntry) => {
    const weight = parseFloat(item.unit_weight_kg) || 0
    if (weight > 0) return item.quantity * weight * item.unit_price
    return item.quantity * item.unit_price
  }

  const grandTotal = items.reduce((acc, item) => acc + calcItemTotal(item), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.customer_id) { toast.error('Sélectionnez un client.'); return }
    setLoading(true)

    // 1. Créer la vente
    const { data: sale, error: saleErr } = await supabase
      .from('sales')
      .insert({
        batch_id: form.batch_id,
        customer_id: form.customer_id,
        date: form.date,
        status: 'pending',
        total_amount: grandTotal,
        notes: form.notes || null,
      })
      .select().single()

    if (saleErr) { toast.error(saleErr.message); setLoading(false); return }

    // 2. Créer les articles
    const saleItems = items.map((item) => {
      const weight = parseFloat(item.unit_weight_kg) || null
      const totalWeight = weight ? item.quantity * weight : null
      const totalPrice = calcItemTotal(item)
      return {
        sale_id: sale.id,
        quantity: item.quantity,
        unit_weight_kg: weight,
        total_weight_kg: totalWeight,
        unit_price: item.unit_price,
        total_price: totalPrice,
        description: item.description || null,
      }
    })

    const { error: itemsErr } = await supabase.from('sale_items').insert(saleItems)
    if (itemsErr) { toast.error(itemsErr.message); setLoading(false); return }

    toast.success('Vente créée avec succès !')
    router.refresh()
    setOpen(false)
    setLoading(false)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-primary" id="create-sale-btn">
        <Plus size={16} /> Nouvelle vente
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl w-full max-w-2xl animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--card-border)]">
              <h2 className="text-base font-semibold text-[var(--foreground)]">Nouvelle vente</h2>
              <button onClick={() => setOpen(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
              {/* Entête vente */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Lot *</label>
                  <select value={form.batch_id}
                    onChange={(e) => setForm(p => ({ ...p, batch_id: e.target.value }))}
                    required className="input" id="sale-batch">
                    {batches.map(b => <option key={b.id} value={b.id}>Lot {b.batch_number}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Date *</label>
                  <input type="date" value={form.date}
                    onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))}
                    required className="input" id="sale-date" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Client *</label>
                <select value={form.customer_id}
                  onChange={(e) => setForm(p => ({ ...p, customer_id: e.target.value }))}
                  required className="input" id="sale-customer">
                  <option value="">— Sélectionner un client —</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.customer_type})</option>)}
                </select>
              </div>

              {/* Articles */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wide">
                    Articles vendus
                  </label>
                  <button type="button" onClick={addItem}
                    className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1">
                    <Plus size={12} /> Ajouter une ligne
                  </button>
                </div>

                <div className="space-y-3">
                  {/* En-tête tableau */}
                  <div className="grid grid-cols-12 gap-2 text-[10px] font-semibold uppercase text-[var(--muted)] px-1">
                    <span className="col-span-3">Description</span>
                    <span className="col-span-2">Qté</span>
                    <span className="col-span-2">Poids/unit (kg)</span>
                    <span className="col-span-2">Prix/kg ou /tête (FCFA)</span>
                    <span className="col-span-2 text-right">Total</span>
                    <span className="col-span-1"></span>
                  </div>

                  {items.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <input value={item.description}
                        onChange={(e) => updateItem(i, 'description', e.target.value)}
                        placeholder="Poulet de chair" className="input col-span-3 text-xs" id={`sale-item-desc-${i}`} />
                      <input type="number" value={item.quantity} min={1}
                        onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))}
                        className="input col-span-2 text-xs" id={`sale-item-qty-${i}`} />
                      <input type="number" value={item.unit_weight_kg}
                        onChange={(e) => updateItem(i, 'unit_weight_kg', e.target.value)}
                        placeholder="optionnel" min={0} step="0.001"
                        className="input col-span-2 text-xs" id={`sale-item-weight-${i}`} />
                      <input type="number" value={item.unit_price} min={0}
                        onChange={(e) => updateItem(i, 'unit_price', Number(e.target.value))}
                        className="input col-span-2 text-xs" id={`sale-item-price-${i}`} />
                      <div className="col-span-2 text-right text-sm font-semibold text-[var(--foreground)]">
                        {calcItemTotal(item).toLocaleString('fr-FR')}
                      </div>
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(i)}
                          className="col-span-1 text-[var(--muted)] hover:text-[#ef4444] transition-colors flex justify-center">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-end mt-4 pt-3 border-t border-[var(--card-border)]">
                  <div className="text-right">
                    <p className="text-xs text-[var(--muted)]">Total vente</p>
                    <p className="text-xl font-bold text-[var(--primary)]">
                      {grandTotal.toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Notes</label>
                <textarea value={form.notes}
                  onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))}
                  rows={2} className="input resize-none" id="sale-notes" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary flex-1">Annuler</button>
                <button type="submit" disabled={loading} className="btn btn-primary flex-1 justify-center">
                  {loading ? <><Loader2 size={14} className="animate-spin" /> Création...</> : 'Créer la vente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
