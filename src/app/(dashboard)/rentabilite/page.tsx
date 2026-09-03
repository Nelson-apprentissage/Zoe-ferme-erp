import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/shared/Header'
import { RentabiliteView } from '@/components/modules/rentabilite/RentabiliteView'

export default async function RentabilitePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('*, farms(*)').eq('user_id', user?.id ?? '').single()
  const farm = profile?.farms

  const { data: batches } = await supabase
    .from('batches').select('id, batch_number, status, start_date')
    .eq('farm_id', farm?.id ?? '').order('start_date', { ascending: false })

  const [
    { data: financials },
    { data: zootechnical },
  ] = await Promise.all([
    supabase.from('batch_financials').select('*').eq('farm_id', farm?.id ?? ''),
    supabase.from('batch_zootechnical').select('*').eq('farm_id', farm?.id ?? ''),
  ])

  return (
    <div className="animate-fade-in">
      <Header title="Rentabilité" subtitle="Analyse financière et zootechnique par lot" />
      <div className="p-6">
        <RentabiliteView
          financials={financials ?? []}
          zootechnical={zootechnical ?? []}
          batches={batches ?? []}
        />
      </div>
    </div>
  )
}
