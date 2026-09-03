'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Building, Supplier, Batch } from '@/types'

interface BatchFormModalProps {
  farmId: string
  buildings: Building[]
  suppliers: Supplier[]
  batch?: Batch  // If provided, we're editing
  onClose: () => void
}

export function BatchFormModal({
  farmId,
  buildings,
  suppliers,
  batch,
  onClose,
}: BatchFormModalProps) {
  const isEditing = !!batch
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    batch_number: batch?.batch_number ?? '',
    start_date: batch?.start_date ?? new Date().toISOString().split('T')[0],
    building_id: batch?.building_id ?? '',
    supplier_id: batch?.supplier_id ?? '',
    initial_count: batch?.initial_count ?? 500,
    breed: batch?.breed ?? '',
    purchase_price_per_unit: batch?.purchase_price_per_unit ?? '',
    notes: batch?.notes ?? '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      farm_id: farmId,
      batch_number: form.batch_number,
      start_date: form.start_date,
      building_id: form.building_id || null,
      supplier_id: form.supplier_id || null,
      initial_count: Number(form.initial_count),
      breed: form.breed || null,
      purchase_price_per_unit: form.purchase_price_per_unit ? Number(form.purchase_price_per_unit) : null,
      notes: form.notes || null,
      status: 'active',
    }

    let error
    if (isEditing) {
      ;({ error } = await supabase.from('batches').update(payload).eq('id', batch.id))
    } else {
      ;({ error } = await supabase.from('batches').insert(payload))
    }

    if (error) {
      toast.error(`Erreur : ${error.message}`)
      setLoading(false)
      return
    }

    toast.success(isEditing ? 'Lot mis à jour !' : 'Lot créé avec succès !')
    router.refresh()
    onClose()
  }

  const update = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--card-border)]">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            {isEditing ? 'Modifier le lot' : 'Nouveau lot'}
          </h2>
          <button onClick={onClose} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">
                Numéro du lot *
              </label>
              <input
                type="text"
                value={form.batch_number}
                onChange={(e) => update('batch_number', e.target.value)}
                placeholder="ex: LOT-001"
                required
                className="input"
                id="batch-number"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">
                Date de mise en place *
              </label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => update('start_date', e.target.value)}
                required
                className="input"
                id="batch-start-date"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">
                Nombre initial *
              </label>
              <input
                type="number"
                value={form.initial_count}
                onChange={(e) => update('initial_count', e.target.value)}
                min={1}
                required
                className="input"
                id="batch-initial-count"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">
                Race / Souche
              </label>
              <input
                type="text"
                value={form.breed}
                onChange={(e) => update('breed', e.target.value)}
                placeholder="ex: Ross 308"
                className="input"
                id="batch-breed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">
                Bâtiment
              </label>
              <select
                value={form.building_id}
                onChange={(e) => update('building_id', e.target.value)}
                className="input"
                id="batch-building"
              >
                <option value="">— Choisir —</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">
                Fournisseur poussins
              </label>
              <select
                value={form.supplier_id}
                onChange={(e) => update('supplier_id', e.target.value)}
                className="input"
                id="batch-supplier"
              >
                <option value="">— Choisir —</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">
              Prix d'achat par poussin (FCFA)
            </label>
            <input
              type="number"
              value={form.purchase_price_per_unit}
              onChange={(e) => update('purchase_price_per_unit', e.target.value)}
              placeholder="ex: 350"
              min={0}
              step="0.01"
              className="input"
              id="batch-purchase-price"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Informations complémentaires..."
              rows={2}
              className="input resize-none"
              id="batch-notes"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary flex-1 justify-center">
              {loading ? (
                <><Loader2 size={14} className="animate-spin" /> {isEditing ? 'Mise à jour...' : 'Créer...'}</>
              ) : (
                isEditing ? 'Mettre à jour' : 'Créer le lot'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
