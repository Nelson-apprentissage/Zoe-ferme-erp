import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/shared/Header'
import { CustomersList } from '@/components/modules/clients/CustomersList'
import { CreateCustomerButton } from '@/components/modules/clients/CreateCustomerButton'

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('*, farms(*)').eq('user_id', user?.id ?? '').single()
  const farm = profile?.farms

  const [{ data: customers }, { data: balances }] = await Promise.all([
    supabase.from('customers').select('*').eq('farm_id', farm?.id ?? '').order('name'),
    supabase.from('customer_balances').select('*').eq('farm_id', farm?.id ?? ''),
  ])

  return (
    <div className="animate-fade-in">
      <Header
        title="Clients"
        subtitle="Gestion du carnet clients et des soldes"
        actions={<CreateCustomerButton farmId={farm?.id ?? ''} />}
      />
      <div className="p-6">
        <CustomersList customers={customers ?? []} balances={balances ?? []} />
      </div>
    </div>
  )
}
