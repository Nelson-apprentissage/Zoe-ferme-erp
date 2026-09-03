'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { X, Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { FeedProduct } from '@/types'

interface ConsumptionEntry {
  product_id: string
  quantity_kg: number
}

export function DailyRecordModal({
  batchId,
  feedProducts,
  onClose,
}: {
  batchId: string
  feedProducts: FeedProduct[]
  onClose: () => void
}) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    date: today,
    living_count: '',
    water_consumption_l: '',
    notes: '',
  })
  const [consumptions, setConsumptions] = useState<ConsumptionEntry[]>([
    { product_id: feedProducts[0]?.id ?? '', quantity_kg: 0 },
  ])

  const addConsumption = () =>
    setConsumptions((prev) => [...prev, { product_id: feedProducts[0]?.id ?? '', quantity_kg: 0 }])

  const removeConsumption = (i: number) =>
    setConsumptions((prev) => prev.filter((_, idx) => idx !== i))

  const updateConsumption = (i: number, field: keyof ConsumptionEntry, value: string | number) =>
    setConsumptions((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c))
    )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.living_count) { toast.error('L\'effectif vivant est obligatoire.'); return }
    setLoading(true)

    // 1. Insérer le suivi quotidien
    const { data: record, error: recErr } = await supabase
      .from('daily_records')
      .upsert({
        batch_id: batchId,
        date: form.date,
        living_count: Number(form.living_count),
        water_consumption_l: form.water_consumption_l ? Number(form.water_consumption_l) : null,
        notes: form.notes || null,
      }, { onConflict: 'batch_id,date' })
      .select()
      .single()

    if (recErr) { toast.error(recErr.message); setLoading(false); return }

    // 2. Insérer les consommations aliment
    const validConsumptions = consumptions.filter(
      (c) => c.product_id && c.quantity_kg > 0
    )
    if (validConsumptions.length > 0) {
      const { error: feedErr } = await supabase.from('feed_consumption').insert(
        validConsumptions.map((c) => ({
          batch_id: batchId,
          daily_record_id: record.id,
          product_id: c.product_id,
          date: form.date,
          quantity_kg: c.quantity_kg,
        }))
      )
      if (feedErr) { toast.error(feedErr.message); setLoading(false); return }
    }

    toast.success('Suivi du jour enregistré !')
    router.refresh()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl w-full max-w-lg animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--card-border)]">
          <h2 className="text-base font-semibold text-[var(--foreground)]">Saisie quotidienne</h2>
          <button onClick={onClose} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Date *</label>
              <input type="date" value={form.date}
                onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))}
                required className="input" id="daily-date" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Effectif vivant *</label>
              <input type="number" value={form.living_count}
                onChange={(e) => setForm(p => ({ ...p, living_count: e.target.value }))}
                placeholder="ex: 485" min={0} required className="input" id="daily-living-count" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Consommation eau (litres)</label>
            <input type="number" value={form.water_consumption_l}
              onChange={(e) => setForm(p => ({ ...p, water_consumption_l: e.target.value }))}
              placeholder="ex: 45" min={0} step="0.1" className="input" id="daily-water" />
          </div>

          {/* Consommation aliment */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-[var(--muted-fg)]">Aliment distribué</label>
              <button type="button" onClick={addConsumption}
                className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1">
                <Plus size={12} /> Ajouter
              </button>
            </div>
            <div className="space-y-2">
              {consumptions.map((c, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select value={c.product_id}
                    onChange={(e) => updateConsumption(i, 'product_id', e.target.value)}
                    className="input flex-1" id={`daily-feed-product-${i}`}>
                    <option value="">— Aliment —</option>
                    {feedProducts.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <input type="number" value={c.quantity_kg}
                    onChange={(e) => updateConsumption(i, 'quantity_kg', Number(e.target.value))}
                    placeholder="kg" min={0} step="0.1" className="input w-24" id={`daily-feed-qty-${i}`} />
                  {consumptions.length > 1 && (
                    <button type="button" onClick={() => removeConsumption(i)}
                      className="text-[var(--muted)] hover:text-[#ef4444] transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">Notes</label>
            <textarea value={form.notes}
              onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Observations du jour..." rows={2} className="input resize-none" id="daily-notes" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Annuler</button>
            <button type="submit" disabled={loading} className="btn btn-primary flex-1 justify-center">
              {loading ? <><Loader2 size={14} className="animate-spin" /> Enregistrement...</> : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
