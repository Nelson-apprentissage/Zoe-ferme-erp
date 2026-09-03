'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function CreateCustomerButton({ farmId }: { farmId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    name: '', phone: '', address: '',
    customer_type: 'particulier', notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('customers').insert({
      farm_id: farmId, ...form, notes: form.notes || null,
      address: form.address || null, phone: form.phone || null,
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success('Client créé !')
    router.refresh(); setOpen(false); setLoading(false)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-primary" id="create-customer-btn">
        <Plus size={16} /> Nouveau client
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--card-border)]">
              <h2 className="text-base font-semibold text-[var(--foreground)]">Nouveau client</h2>
              <button onClick={() => setOpen(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Nom *</label>
                <input type="text" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Nom du client" required className="input" id="customer-name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Téléphone</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="6XXXXXXXX" className="input" id="customer-phone" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Type</label>
                  <select value={form.customer_type} onChange={(e) => setForm(p => ({ ...p, customer_type: e.target.value }))}
                    className="input" id="customer-type">
                    <option value="particulier">Particulier</option>
                    <option value="revendeur">Revendeur</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Adresse</label>
                <input type="text" value={form.address} onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))}
                  placeholder="Quartier, ville..." className="input" id="customer-address" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))}
                  rows={2} className="input resize-none" id="customer-notes" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary flex-1">Annuler</button>
                <button type="submit" disabled={loading} className="btn btn-primary flex-1 justify-center">
                  {loading ? <><Loader2 size={14} className="animate-spin" /> Création...</> : 'Créer le client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
