'use client'

import { Bell, Search } from 'lucide-react'
import { MobileMenuButton } from './Sidebar'

interface HeaderProps {
  title: string
  subtitle?: string
  onMobileMenuOpen?: () => void
  actions?: React.ReactNode
}

export function Header({ title, subtitle, onMobileMenuOpen, actions }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 px-6 py-4 border-b bg-[var(--background)] border-[var(--card-border)]">
      <MobileMenuButton onClick={onMobileMenuOpen ?? (() => {})} />

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-[var(--foreground)] truncate">{title}</h1>
        {subtitle && (
          <p className="text-xs text-[var(--muted)] mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {actions}
        <button className="p-2 rounded-lg text-[var(--muted-fg)] hover:text-[var(--foreground)] hover:bg-[var(--card)] transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[var(--primary)] rounded-full" />
        </button>
      </div>
    </header>
  )
}
