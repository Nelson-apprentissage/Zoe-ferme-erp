import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/shared/Header'
import { SanteList } from '@/components/modules/sante/SanteList'
import { CreateSanteButton } from '@/components/modules/sante/CreateSanteButton'

export default async function SantePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const farmId = user ? (await supabase.from('profiles').select('*, farms(*)').eq('user_id', user?.id ?? '').single()).data?.farms?.id ?? '' : ''
  const { data: activeBatches } = await supabase.from('batches').select('id, batch_number').eq('farm_id', farmId).eq('status', 'active')
  const batchId = activeBatches?.[0]?.id ?? ''
  const { data: records } = await supabase.from('health_records').select('*, batches(batch_number)').eq('batch_id', batchId).order('date', { ascending: false })

  return (
    <div className="animate-fade-in">
      <Header title="Santé" subtitle="Vaccinations et traitements vétérinaires"
        actions={batchId ? <CreateSanteButton batchId={batchId} /> : undefined} />
      <div className="p-6">
        {!batchId
          ? <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-12 text-center"><p className="text-[var(--muted)] text-sm">Aucun lot actif.</p></div>
          : <SanteList records={records ?? []} />}
      </div>
    </div>
  )
}
