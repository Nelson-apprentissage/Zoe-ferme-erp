import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/shared/Header'
import { SalesList } from '@/components/modules/ventes/SalesList'
import { CreateSaleButton } from '@/components/modules/ventes/CreateSaleButton'

export default async function VentesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('*, farms(*)').eq('user_id', user?.id ?? '').single()
  const farm = profile?.farms

  const [
    { data: activeBatches },
    { data: customers },
    { data: sales },
  ] = await Promise.all([
    supabase.from('batches').select('id, batch_number')
      .eq('farm_id', farm?.id ?? '').eq('status', 'active'),
    supabase.from('customers').select('*').eq('farm_id', farm?.id ?? '').order('name'),
    supabase.from('sales')
      .select('*, customers(name), batches(batch_number), sale_items(*), payments(*)')
      .in('batch_id', (await supabase.from('batches').select('id').eq('farm_id', farm?.id ?? '')).data?.map(b => b.id) ?? [])
      .order('date', { ascending: false }),
  ])

  return (
    <div className="animate-fade-in">
      <Header
        title="Ventes"
        subtitle="Facturation et suivi des ventes de poulets"
        actions={
          <CreateSaleButton
            batches={activeBatches ?? []}
            customers={customers ?? []}
          />
        }
      />
      <div className="p-6">
        <SalesList sales={sales ?? []} customers={customers ?? []} batches={activeBatches ?? []} />
      </div>
    </div>
  )
}
