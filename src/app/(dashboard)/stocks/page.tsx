import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/shared/Header'
import { StocksList } from '@/components/modules/stocks/StocksList'

export default async function StocksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const farmId = user ? (await supabase.from('profiles').select('*, farms(*)').eq('user_id', user?.id ?? '').single()).data?.farms?.id ?? '' : ''

  const [{ data: stocks }, { data: alerts }] = await Promise.all([
    supabase.from('stock_items').select('*, stock_categories(name, color)').eq('farm_id', farmId).order('name'),
    supabase.from('stock_alerts').select('*').eq('farm_id', farmId),
  ])

  return (
    <div className="animate-fade-in">
      <Header title="Stocks" subtitle="Gestion des articles en stock" />
      <div className="p-6 space-y-4">
        {alerts && alerts.length > 0 && (
          <div className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-xl p-4">
            <p className="text-sm font-medium text-[#ef4444]">⚠️ {alerts.length} article(s) en rupture ou sous le seuil minimum</p>
          </div>
        )}
        <StocksList stocks={stocks ?? []} alerts={alerts ?? []} />
      </div>
    </div>
  )
}
