import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/shared/Header'
import { AlimentList } from '@/components/modules/aliment/AlimentList'
import { CreateAlimentButton } from '@/components/modules/aliment/CreateAlimentButton'

export default async function AlimentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const farmId = user
    ? (await supabase.from('profiles').select('*, farms(*)').eq('user_id', user?.id ?? '').single()).data?.farms?.id ?? ''
    : ''

  const { data: activeBatches } = await supabase
    .from('batches').select('id, batch_number').eq('farm_id', farmId).eq('status', 'active')

  const [{ data: feedProducts }, { data: feedPurchases }, { data: consumption }] = await Promise.all([
    supabase.from('feed_products').select('*').eq('farm_id', farmId).order('name'),
    supabase.from('feed_purchases').select('*, feed_products(name, unit), suppliers(name)')
      .eq('farm_id', farmId).order('date', { ascending: false }),
    supabase.from('feed_consumption').select('*, feed_products(name, unit), batches(batch_number)')
      .in('batch_id', activeBatches?.map(b => b.id) ?? []).order('date', { ascending: false }).limit(30),
  ])

  const totalKgPurchased = feedPurchases?.reduce((acc, p) => acc + p.quantity_kg, 0) ?? 0
  const totalKgConsumed = consumption?.reduce((acc, c) => acc + c.quantity_kg, 0) ?? 0
  const totalCost = feedPurchases?.reduce((acc, p) => acc + (p.total_cost ?? 0), 0) ?? 0

  return (
    <div className="animate-fade-in">
      <Header
        title="Aliment"
        subtitle="Achats et consommation d'aliment par lot"
        actions={
          <CreateAlimentButton
            farmId={farmId}
            feedProducts={feedProducts ?? []}
            batches={activeBatches ?? []}
          />
        }
      />
      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total acheté', value: `${totalKgPurchased.toLocaleString('fr-FR')} kg`, color: 'text-[var(--primary)]' },
            { label: 'Total consommé', value: `${totalKgConsumed.toLocaleString('fr-FR')} kg`, color: 'text-[#f59e0b]' },
            { label: 'Coût total aliment', value: `${totalCost.toLocaleString('fr-FR')} FCFA`, color: 'text-[#ef4444]' },
          ].map(k => (
            <div key={k.label} className="kpi-card">
              <p className="text-xs text-[var(--muted-fg)] mb-1">{k.label}</p>
              <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>
        <AlimentList
          feedPurchases={feedPurchases ?? []}
          consumption={consumption ?? []}
          feedProducts={feedProducts ?? []}
        />
      </div>
    </div>
  )
}
