import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/shared/Header'
import { BatchList } from '@/components/modules/lots/BatchList'
import { CreateBatchButton } from '@/components/modules/lots/CreateBatchButton'

export default async function LotsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const farmId = user ? (await supabase.from('profiles').select('*, farms(*)').eq('user_id', user?.id ?? '').single()).data?.farms?.id ?? '' : ''

  const [
    { data: batches },
    { data: buildings },
    { data: suppliers },
    { data: batchSummaries },
  ] = await Promise.all([
    supabase.from('batches').select('*, buildings(name), suppliers(name)').eq('farm_id', farmId).order('created_at', { ascending: false }),
    supabase.from('buildings').select('*').eq('farm_id', farmId),
    supabase.from('suppliers').select('*').eq('farm_id', farmId).eq('type', 'poussin'),
    supabase.from('batch_summary').select('*').eq('farm_id', farmId),
  ])

  return (
    <div className="animate-fade-in">
      <Header
        title="Lots"
        subtitle="Gestion des bandes de poulets de chair"
        actions={<CreateBatchButton farmId={farmId} buildings={buildings ?? []} suppliers={suppliers ?? []} />}
      />
      <div className="p-6">
        <BatchList
          batches={batches ?? []}
          summaries={batchSummaries ?? []}
          farmId={farmId}
          buildings={buildings ?? []}
          suppliers={suppliers ?? []}
        />
      </div>
    </div>
  )
}
