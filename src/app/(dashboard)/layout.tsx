'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/shared/Sidebar'
import { cn } from '@/lib/utils'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      {/* Main content */}
      <main className={cn(
        'flex-1 flex flex-col min-w-0 overflow-y-auto transition-all duration-300'
      )}>
        {children}
      </main>
    </div>
  )
}
