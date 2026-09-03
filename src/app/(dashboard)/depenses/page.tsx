import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/shared/Header'
import { DepensesList } from '@/components/modules/depenses/DepensesList'
import { CreateDepenseButton } from '@/components/modules/depenses/CreateDepenseButton'

export default async function DepensesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('*, farms(*)').eq('user_id', user?.id ?? '').single()
  const farm = profile?.farms

  const [
    { data: activeBatches },
    { data: categories },
    { data: suppliers },
    { data: expenses },
  ] = await Promise.all([
    supabase.from('batches').select('id, batch_number')
      .eq('farm_id', farm?.id ?? '').eq('status', 'active'),
    supabase.from('expense_categories').select('*').eq('farm_id', farm?.id ?? ''),
    supabase.from('suppliers').select('*').eq('farm_id', farm?.id ?? ''),
    supabase.from('expenses')
      .select('*, expense_categories(name, color), suppliers(name)')
      .in('batch_id', (await supabase.from('batches').select('id').eq('farm_id', farm?.id ?? '')).data?.map(b => b.id) ?? [])
      .order('date', { ascending: false }),
  ])

  const totalExpenses = expenses?.reduce((acc, e) => acc + e.amount, 0) ?? 0

  return (
    <div className="animate-fade-in">
      <Header
        title="Dépenses"
        subtitle="Saisie et synthèse des dépenses par lot"
        actions={
          <CreateDepenseButton
            batches={activeBatches ?? []}
            categories={categories ?? []}
            suppliers={suppliers ?? []}
          />
        }
      />
      <div className="p-6 space-y-4">
        {/* KPI total */}
        <div className="kpi-card inline-flex flex-col">
          <p className="text-xs text-[var(--muted-fg)] mb-1">Total dépenses</p>
          <p className="text-2xl font-bold text-[#ef4444]">
            {totalExpenses.toLocaleString('fr-FR')} FCFA
          </p>
        </div>
        <DepensesList expenses={expenses ?? []} />
      </div>
    </div>
  )
}
