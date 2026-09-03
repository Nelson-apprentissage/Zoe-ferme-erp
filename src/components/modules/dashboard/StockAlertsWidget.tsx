'use client'

import { AlertTriangle } from 'lucide-react'
import type { StockAlert } from '@/types'
import { formatNumber } from '@/lib/utils'
import Link from 'next/link'

interface StockAlertsWidgetProps {
  alerts: StockAlert[]
}

export function StockAlertsWidget({ alerts }: StockAlertsWidgetProps) {
  return (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">
          Alertes Stock
        </h3>
        <Link href="/stocks" className="text-xs text-[var(--primary)] hover:underline">
          Voir tout →
        </Link>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-10 h-10 rounded-full bg-[rgba(34,197,94,0.1)] flex items-center justify-center mb-3">
            <AlertTriangle size={18} className="text-[var(--primary)]" />
          </div>
          <p className="text-sm text-[var(--muted)]">Tous les stocks sont OK</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between py-2.5 border-b border-[var(--card-border)] last:border-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <AlertTriangle
                  size={14}
                  className={alert.alert_level === 'rupture' ? 'text-[#ef4444]' : 'text-[#f59e0b]'}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">{alert.name}</p>
                  <p className="text-xs text-[var(--muted)]">{alert.category}</p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <p
                  className={`text-sm font-semibold ${
                    alert.alert_level === 'rupture' ? 'text-[#ef4444]' : 'text-[#f59e0b]'
                  }`}
                >
                  {formatNumber(alert.current_quantity)} {alert.unit}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {alert.alert_level === 'rupture' ? 'Rupture' : 'Critique'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
