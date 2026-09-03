import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/shared/Header'
import { DashboardKPIs } from '@/components/modules/dashboard/DashboardKPIs'
import { DashboardCharts } from '@/components/modules/dashboard/DashboardCharts'
import { RecentActivity } from '@/components/modules/dashboard/RecentActivity'
import { StockAlertsWidget } from '@/components/modules/dashboard/StockAlertsWidget'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Mode développement : on continue même sans session
  const { data: { user } } = await supabase.auth.getUser()

  let farmName = 'Zoé Ferme'
  let farmLocation = 'Yaoundé, Nkonda, Cameroun'
  let activeBatches: any[] = []
  let batchSummaries: any[] = []
  let stockAlerts: any[] = []
  let recentSales: any[] = []

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, farms(*)')
      .eq('user_id', user?.id ?? '')
      .single()

    const farm = (profile as any)?.farms
    if (farm) {
      farmName = farm.name
      farmLocation = farm.location

      const [b, s, a, r] = await Promise.all([
        supabase.from('batches').select('*').eq('farm_id', farm.id).eq('status', 'active'),
        supabase.from('batch_summary').select('*').eq('farm_id', farm.id),
        supabase.from('stock_alerts').select('*').eq('farm_id', farm.id),
        supabase.from('sales').select('*, customers(name)').order('date', { ascending: false }).limit(5),
      ])
      activeBatches = b.data ?? []
      batchSummaries = s.data ?? []
      stockAlerts = a.data ?? []
      recentSales = r.data ?? []
    }
  }

  const totalLiving = batchSummaries.reduce((acc: number, b: any) => acc + (b.current_count || 0), 0)
  const totalMortality = batchSummaries.reduce((acc: number, b: any) => acc + (b.total_mortality || 0), 0)

  return (
    <div className="animate-fade-in">
      <Header title="Dashboard" subtitle={`${farmName} — ${farmLocation}`} />
      <div className="p-6 space-y-6">
        <DashboardKPIs
          activeBatchCount={activeBatches.length}
          totalLiving={totalLiving}
          totalMortality={totalMortality}
          totalReceivable={0}
          stockAlertCount={stockAlerts.length}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DashboardCharts batches={batchSummaries} />
          </div>
          <div>
            <StockAlertsWidget alerts={stockAlerts} />
          </div>
        </div>
        <RecentActivity sales={recentSales} />
      </div>
    </div>
  )
}
