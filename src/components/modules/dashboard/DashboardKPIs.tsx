'use client'

import { formatNumber, formatCurrency } from '@/lib/utils'
import {
  Package, Bird, Skull, CreditCard, AlertTriangle, TrendingUp
} from 'lucide-react'

interface DashboardKPIsProps {
  activeBatchCount: number
  totalLiving: number
  totalMortality: number
  totalReceivable: number
  stockAlertCount: number
}

export function DashboardKPIs({
  activeBatchCount,
  totalLiving,
  totalMortality,
  totalReceivable,
  stockAlertCount,
}: DashboardKPIsProps) {
  const kpis = [
    {
      id: 'active-batches',
      title: 'Lots actifs',
      value: activeBatchCount,
      unit: 'lot(s)',
      icon: Package,
      color: '#3b82f6',
      bg: 'rgba(59,130,246,0.1)',
    },
    {
      id: 'living-count',
      title: 'Effectif vivant',
      value: formatNumber(totalLiving),
      unit: 'sujets',
      icon: Bird,
      color: '#22c55e',
      bg: 'rgba(34,197,94,0.1)',
    },
    {
      id: 'total-mortality',
      title: 'Mortalité totale',
      value: formatNumber(totalMortality),
      unit: 'morts',
      icon: Skull,
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.1)',
    },
    {
      id: 'receivable',
      title: 'Créances clients',
      value: formatCurrency(totalReceivable),
      unit: '',
      icon: CreditCard,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.1)',
    },
    {
      id: 'stock-alerts',
      title: 'Alertes stock',
      value: stockAlertCount,
      unit: 'article(s)',
      icon: AlertTriangle,
      color: stockAlertCount > 0 ? '#ef4444' : '#22c55e',
      bg: stockAlertCount > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon
        return (
          <div key={kpi.id} id={`kpi-${kpi.id}`} className="kpi-card">
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: kpi.bg }}
              >
                <Icon size={18} style={{ color: kpi.color }} />
              </div>
            </div>
            <p className="text-[var(--muted-fg)] text-xs mb-1">{kpi.title}</p>
            <p className="text-xl font-bold text-[var(--foreground)]">{kpi.value}</p>
            {kpi.unit && (
              <p className="text-xs text-[var(--muted)] mt-0.5">{kpi.unit}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
