import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/shared/Header'
import { PaiementsList } from '@/components/modules/paiements/PaiementsList'

export default async function PaiementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const farmId = user ? (await supabase.from('profiles').select('*, farms(*)').eq('user_id', user?.id ?? '').single()).data?.farms?.id ?? '' : ''

  const [{ data: payments }, { data: balances }] = await Promise.all([
    supabase.from('payments').select('*, customers(name), sales(total_amount, date)').order('date', { ascending: false }).limit(50),
    supabase.from('customer_balances').select('*').eq('farm_id', farmId).gt('balance_due', 0).order('balance_due', { ascending: false }),
  ])

  const totalReceivable = balances?.reduce((acc, b) => acc + b.balance_due, 0) ?? 0

  return (
    <div className="animate-fade-in">
      <Header title="Paiements" subtitle="Historique des encaissements et créances clients" />
      <div className="p-6 space-y-6">
        {totalReceivable > 0 && (
          <div className="kpi-card">
            <p className="text-xs text-[var(--muted-fg)] mb-1">Total créances clients</p>
            <p className="text-2xl font-bold text-[#ef4444]">{totalReceivable.toLocaleString('fr-FR')} FCFA</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">{balances?.length} client(s) avec solde impayé</p>
          </div>
        )}
        <PaiementsList payments={payments ?? []} balances={balances ?? []} />
      </div>
    </div>
  )
}
