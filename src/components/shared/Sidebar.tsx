'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  CalendarDays,
  Wheat,
  Scale,
  HeartPulse,
  Skull,
  Receipt,
  Boxes,
  Users,
  ShoppingCart,
  CreditCard,
  TrendingUp,
  Settings,
  ChevronLeft,
  Menu,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  {
    group: 'Vue générale',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Production',
    items: [
      { href: '/lots', label: 'Lots', icon: Package },
      { href: '/suivi-quotidien', label: 'Suivi quotidien', icon: CalendarDays },
      { href: '/aliment', label: 'Aliment', icon: Wheat },
      { href: '/poids', label: 'Poids', icon: Scale },
      { href: '/sante', label: 'Santé', icon: HeartPulse },
      { href: '/mortalite', label: 'Mortalité', icon: Skull },
    ],
  },
  {
    group: 'Finance',
    items: [
      { href: '/depenses', label: 'Dépenses', icon: Receipt },
      { href: '/stocks', label: 'Stocks', icon: Boxes },
      { href: '/clients', label: 'Clients', icon: Users },
      { href: '/ventes', label: 'Ventes', icon: ShoppingCart },
      { href: '/paiements', label: 'Paiements', icon: CreditCard },
      { href: '/rentabilite', label: 'Rentabilité', icon: TrendingUp },
    ],
  },
  {
    group: 'Système',
    items: [
      { href: '/parametres', label: 'Paramètres', icon: Settings },
    ],
  },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out border-r',
        'bg-[var(--sidebar)] border-[var(--sidebar-border)]',
        collapsed ? 'w-[60px]' : 'w-[240px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--sidebar-border)]">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-bold text-sm">
              ZF
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--foreground)] leading-none">Zoé Ferme</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">ERP Avicole</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-bold text-sm mx-auto">
            ZF
          </div>
        )}
        <button
          onClick={onToggle}
          className={cn(
            'p-1.5 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)] transition-colors',
            collapsed && 'hidden'
          )}
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {navItems.map((group) => (
          <div key={group.group}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
                {group.group}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-[var(--primary-muted)] text-[var(--primary)]'
                        : 'text-[var(--muted-fg)] hover:text-[var(--foreground)] hover:bg-[var(--card)]',
                      collapsed && 'justify-center px-2'
                    )}
                  >
                    <Icon size={18} className="shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                    {isActive && !collapsed && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom — Sign out */}
      <div className="p-2 border-t border-[var(--sidebar-border)]">
        <button
          onClick={handleSignOut}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium',
            'text-[var(--muted-fg)] hover:text-[#ef4444] hover:bg-[rgba(239,68,68,0.08)] transition-all',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? 'Déconnexion' : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  )
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg text-[var(--muted-fg)] hover:text-[var(--foreground)] hover:bg-[var(--card)] transition-colors lg:hidden"
    >
      <Menu size={20} />
    </button>
  )
}
