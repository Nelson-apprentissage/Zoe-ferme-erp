import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/shared/Header'
import { PoidsView } from '@/components/modules/poids/PoidsView'
import { CreatePoidsButton } from '@/components/modules/poids/CreatePoidsButton'

export default async function PoidsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const farmId = user
    ? (await supabase.from('profiles').select('*, farms(*)').eq('user_id', user?.id ?? '').single()).data?.farms?.id ?? ''
    : ''

  const { data: activeBatches } = await supabase
    .from('batches').select('id, batch_number, start_date').eq('farm_id', farmId).eq('status', 'active')

  const batchId = activeBatches?.[0]?.id ?? ''

  const { data: weightRecords } = await supabase
    .from('weight_records')
    .select('*')
    .eq('batch_id', batchId)
    .order('date', { ascending: true })

  return (
    <div className="animate-fade-in">
      <Header
        title="Poids"
        subtitle="Pesées et courbe de croissance"
        actions={batchId ? <CreatePoidsButton batchId={batchId} /> : undefined}
      />
      <div className="p-6">
        {!batchId ? (
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-12 text-center">
            <p className="text-[var(--muted)] text-sm">Aucun lot actif. Créez d'abord un lot.</p>
          </div>
        ) : (
          <PoidsView
            records={weightRecords ?? []}
            batch={activeBatches![0]}
          />
        )}
      </div>
    </div>
  )
}
