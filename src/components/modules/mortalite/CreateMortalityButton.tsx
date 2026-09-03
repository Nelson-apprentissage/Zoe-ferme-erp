'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function CreateMortalityButton({ batchId }: { batchId: string }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    count: 1,
    cause: '',
    description: '',
  })

  const causeOptions = [
    { value: 'maladie', label: 'Maladie' },
    { value: 'accident', label: 'Accident' },
    { value: 'inconnu', label: 'Inconnu' },
    { value: 'reforme', label: 'Réforme' },
    { value: 'autre', label: 'Autre' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('mortality_records').insert({
      batch_id: batchId,
      date: form.date,
      count: Number(form.count),
      cause: form.cause || null,
      description: form.description || null,
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success('Mortalité enregistrée.')
    router.refresh()
    setOpen(false)
    setLoading(false)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-primary" id="create-mortality-btn">
        <Plus size={16} /> Enregistrer décès
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--card-border)]">
              <h2 className="text-base font-semibold text-[var(--foreground)]">Enregistrer décès</h2>
              <button onClick={() => setOpen(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Date *</label>
                  <input type="date" value={form.date}
                    onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))}
                    required className="input" id="mortality-date" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Nombre *</label>
                  <input type="number" value={form.count} min={1}
                    onChange={(e) => setForm(p => ({ ...p, count: Number(e.target.value) }))}
                    required className="input" id="mortality-count" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Cause</label>
                <select value={form.cause}
                  onChange={(e) => setForm(p => ({ ...p, cause: e.target.value }))}
                  className="input" id="mortality-cause">
                  <option value="">— Sélectionner —</option>
                  {causeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Description</label>
                <textarea value={form.description}
                  onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Détails..." rows={2} className="input resize-none" id="mortality-description" />
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
