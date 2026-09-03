'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, X, Loader2, Heart } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

export function CreateSanteButton({ batchId }: { batchId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'vaccination',
    product_name: '',
    dosage: '',
    veterinarian: '',
    cost: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('health_records').insert({
      batch_id: batchId, date: form.date, type: form.type,
      product_name: form.product_name, dosage: form.dosage || null,
      veterinarian: form.veterinarian || null,
      cost: form.cost ? Number(form.cost) : null,
      notes: form.notes || null,
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success('Intervention enregistrée !')
    router.refresh(); setOpen(false); setLoading(false)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-primary" id="create-health-btn">
        <Plus size={16} /> Nouvelle intervention
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--card-border)]">
              <h2 className="text-base font-semibold text-[var(--foreground)] flex items-center gap-2"><Heart size={16} /> Intervention sanitaire</h2>
              <button onClick={() => setOpen(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required className="input" id="health-date" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Type *</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="input" id="health-type">
                    <option value="vaccination">Vaccination</option>
                    <option value="traitement">Traitement</option>
                    <option value="vitamin">Vitamine</option>
                    <option value="antibiotique">Antibiotique</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Produit / Vaccin *</label>
                <input type="text" value={form.product_name} onChange={e => setForm(p => ({ ...p, product_name: e.target.value }))}
                  placeholder="ex: Newcastle, Gumboro..." required className="input" id="health-product" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Dosage</label>
                  <input type="text" value={form.dosage} onChange={e => setForm(p => ({ ...p, dosage: e.target.value }))}
                    placeholder="ex: 1 dose/sujet" className="input" id="health-dosage" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Coût (FCFA)</label>
                  <input type="number" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))}
                    placeholder="ex: 5000" min={0} className="input" id="health-cost" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Vétérinaire</label>
                <input type="text" value={form.veterinarian} onChange={e => setForm(p => ({ ...p, veterinarian: e.target.value }))}
                  placeholder="Nom du vétérinaire" className="input" id="health-vet" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  rows={2} className="input resize-none" id="health-notes" />
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

export function SanteList({ records }: { records: any[] }) {
  const typeBadge: Record<string, string> = { vaccination: 'badge-blue', traitement: 'badge-yellow', vitamin: 'badge-green', antibiotique: 'badge-red', autre: 'badge-gray' }
  if (records.length === 0) return (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-12 text-center">
      <Heart size={36} className="text-[var(--muted)] mx-auto mb-3" />
      <p className="text-[var(--foreground)] font-medium mb-1">Aucune intervention enregistrée</p>
      <p className="text-[var(--muted)] text-sm">Cliquez sur « Nouvelle intervention ».</p>
    </div>
  )
  return (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl overflow-hidden">
      <table className="data-table">
        <thead><tr><th>Date</th><th>Type</th><th>Produit</th><th>Dosage</th><th>Vétérinaire</th><th>Coût</th></tr></thead>
        <tbody>
          {records.map(r => (
            <tr key={r.id}>
              <td className="text-[var(--muted)]">{formatDate(r.date)}</td>
              <td><span className={`badge ${typeBadge[r.type] ?? 'badge-gray'}`}>{r.type}</span></td>
              <td className="font-medium">{r.product_name}</td>
              <td className="text-[var(--muted)] text-sm">{r.dosage ?? '—'}</td>
              <td className="text-[var(--muted)]">{r.veterinarian ?? '—'}</td>
              <td>{r.cost ? `${r.cost.toLocaleString('fr-FR')} FCFA` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
