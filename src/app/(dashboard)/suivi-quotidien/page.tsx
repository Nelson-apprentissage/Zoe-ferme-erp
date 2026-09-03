import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/shared/Header'
import { DailyRecordList } from '@/components/modules/suivi/DailyRecordList'
import { CreateDailyRecordButton } from '@/components/modules/suivi/CreateDailyRecordButton'

export default async function SuiviQuotidienPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('*, farms(*)').eq('user_id', user?.id ?? '').single()
  const farm = profile?.farms

  const { data: activeBatches } = await supabase
    .from('batches').select('id, batch_number, initial_count, start_date')
    .eq('farm_id', farm?.id ?? '').eq('status', 'active')
    .order('start_date', { ascending: false })

  const batchId = activeBatches?.[0]?.id

  const [{ data: dailyRecords }, { data: feedProducts }] = await Promise.all([
    supabase.from('daily_records').select('*')
      .eq('batch_id', batchId ?? '').order('date', { ascending: false }).limit(30),
    supabase.from('feed_products').select('*').eq('farm_id', farm?.id ?? ''),
  ])

  return (
    <div className="animate-fade-in">
      <Header
        title="Suivi Quotidien"
        subtitle="Enregistrement journalier des effectifs et consommations"
        actions={
          batchId ? (
            <CreateDailyRecordButton
              batchId={batchId}
              feedProducts={feedProducts ?? []}
            />
          ) : undefined
        }
      />
      <div className="p-6">
        {!batchId ? (
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-12 text-center">
            <p className="text-[var(--muted)] text-sm">Aucun lot actif. Créez d&#39;abord un lot dans le module Lots.</p>
          </div>
        ) : (
          <DailyRecordList
            records={dailyRecords ?? []}
            batch={activeBatches[0]}
            batches={activeBatches ?? []}
          />
        )}
      </div>
    </div>
  )
}
