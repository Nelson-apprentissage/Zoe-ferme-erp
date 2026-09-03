'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface CreateDepenseButtonProps {
  batches: { id: string; batch_number: string }[]
  categories: { id: string; name: string; color: string }[]
  suppliers: { id: string; name: string }[]
}

export function CreateDepenseButton({ batches, categories, suppliers }: CreateDepenseButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    batch_id: batches[0]?.id ?? '',
    category_id: '',
    supplier_id: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.amount || Number(form.amount) <= 0) { toast.error('Montant invalide.'); return }
    setLoading(true)

    const { error } = await supabase.from('expenses').insert({
      batch_id: form.batch_id,
      category_id: form.category_id || null,
      supplier_id: form.supplier_id || null,
      date: form.date,
      description: form.description,
      amount: Number(form.amount),
      notes: form.notes || null,
    })

    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success('Dépense enregistrée !')
    router.refresh()
    setOpen(false)
    setLoading(false)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-primary" id="create-expense-btn">
        <Plus size={16} /> Nouvelle dépense
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--card-border)]">
              <h2 className="text-base font-semibold text-[var(--foreground)]">Nouvelle dépense</h2>
              <button onClick={() => setOpen(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Lot *</label>
                  <select value={form.batch_id} onChange={(e) => setForm(p => ({ ...p, batch_id: e.target.value }))}
                    required className="input" id="expense-batch">
                    {batches.map(b => <option key={b.id} value={b.id}>Lot {b.batch_number}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Date *</label>
                  <input type="date" value={form.date}
                    onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))}
                    required className="input" id="expense-date" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Description *</label>
                <input type="text" value={form.description}
                  onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="ex: Achat litière, Frais transport..." required className="input" id="expense-description" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Catégorie</label>
                  <select value={form.category_id} onChange={(e) => setForm(p => ({ ...p, category_id: e.target.value }))}
                    className="input" id="expense-category">
                    <option value="">— Catégorie —</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Montant (FCFA) *</label>
                  <input type="number" value={form.amount}
                    onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))}
                    placeholder="0" min={1} required className="input" id="expense-amount" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Fournisseur</label>
                <select value={form.supplier_id} onChange={(e) => setForm(p => ({ ...p, supplier_id: e.target.value }))}
                  className="input" id="expense-supplier">
                  <option value="">— Fournisseur (optionnel) —</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary flex-1">Annuler</button>
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
