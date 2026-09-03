'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function CreatePoidsButton({ batchId }: { batchId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    sample_size: '',
    avg_weight_g: '',
    min_weight_g: '',
    max_weight_g: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('weight_records').insert({
      batch_id: batchId,
      date: form.date,
      sample_size: form.sample_size ? Number(form.sample_size) : null,
      avg_weight_g: Number(form.avg_weight_g),
      min_weight_g: form.min_weight_g ? Number(form.min_weight_g) : null,
      max_weight_g: form.max_weight_g ? Number(form.max_weight_g) : null,
      notes: form.notes || null,
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success('Pesée enregistrée !')
    router.refresh(); setOpen(false); setLoading(false)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-primary" id="create-weight-btn">
        <Plus size={16} /> Nouvelle pesée
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--card-border)]">
              <h2 className="text-base font-semibold text-[var(--foreground)]">Nouvelle pesée</h2>
              <button onClick={() => setOpen(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    required className="input" id="weight-date" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Effectif pesé</label>
                  <input type="number" value={form.sample_size} min={1}
                    onChange={e => setForm(p => ({ ...p, sample_size: e.target.value }))}
                    placeholder="ex: 10" className="input" id="weight-sample" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Poids moyen (g) *</label>
                <input type="number" value={form.avg_weight_g} min={1}
                  onChange={e => setForm(p => ({ ...p, avg_weight_g: e.target.value }))}
                  placeholder="ex: 1250" required className="input" id="weight-avg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Poids min (g)</label>
                  <input type="number" value={form.min_weight_g} min={1}
                    onChange={e => setForm(p => ({ ...p, min_weight_g: e.target.value }))}
                    placeholder="ex: 1100" className="input" id="weight-min" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Poids max (g)</label>
                  <input type="number" value={form.max_weight_g} min={1}
                    onChange={e => setForm(p => ({ ...p, max_weight_g: e.target.value }))}
                    placeholder="ex: 1400" className="input" id="weight-max" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  rows={2} className="input resize-none" id="weight-notes" />
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
