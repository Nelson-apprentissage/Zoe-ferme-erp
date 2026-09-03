import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/shared/Header'
import { MortalityList } from '@/components/modules/mortalite/MortalityList'
import { CreateMortalityButton } from '@/components/modules/mortalite/CreateMortalityButton'

export default async function MortalitePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('*, farms(*)').eq('user_id', user?.id ?? '').single()
  const farm = profile?.farms

  const { data: activeBatches } = await supabase
    .from('batches').select('id, batch_number, initial_count, start_date')
    .eq('farm_id', farm?.id ?? '').eq('status', 'active')

  const batchId = activeBatches?.[0]?.id

  const { data: records } = await supabase
    .from('mortality_records').select('*')
    .eq('batch_id', batchId ?? '').order('date', { ascending: false })

  const totalMortality = records?.reduce((acc, r) => acc + r.count, 0) ?? 0
  const initialCount = activeBatches?.[0]?.initial_count ?? 0
  const mortalityRate = initialCount > 0 ? (totalMortality / initialCount * 100).toFixed(2) : '0'

  return (
    <div className="animate-fade-in">
      <Header
        title="Mortalité"
        subtitle="Suivi des pertes par lot"
        actions={batchId ? <CreateMortalityButton batchId={batchId} /> : undefined}
      />
      <div className="p-6 space-y-4">
        {batchId && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Mortalité totale', value: totalMortality, unit: 'morts', color: '#ef4444' },
              { label: 'Taux de mortalité', value: `${mortalityRate}%`, unit: '', color: Number(mortalityRate) > 5 ? '#ef4444' : '#22c55e' },
              { label: 'Effectif initial', value: initialCount, unit: 'sujets', color: '#3b82f6' },
            ].map((kpi) => (
              <div key={kpi.label} className="kpi-card">
                <p className="text-xs text-[var(--muted-fg)] mb-1">{kpi.label}</p>
                <p className="text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
                {kpi.unit && <p className="text-xs text-[var(--muted)]">{kpi.unit}</p>}
              </div>
            ))}
          </div>
        )}
        {!batchId ? (
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-12 text-center">
            <p className="text-[var(--muted)] text-sm">Aucun lot actif.</p>
          </div>
        ) : (
          <MortalityList records={records ?? []} />
        )}
      </div>
    </div>
  )
}
