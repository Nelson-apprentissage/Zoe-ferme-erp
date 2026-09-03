import { Header } from '@/components/shared/Header'
import { Settings, Database, Bell, Shield } from 'lucide-react'

export default function ParametresPage() {
  const sections = [
    {
      icon: Database,
      title: 'Base de données Supabase',
      description: 'Votre base de données est hébergée sur Supabase.',
      items: [
        { label: 'URL Supabase', value: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '—' },
        { label: 'Statut', value: '✅ Connecté' },
      ]
    },
    {
      icon: Settings,
      title: 'Ferme',
      description: 'Informations sur votre exploitation.',
      items: [
        { label: 'Nom', value: 'Zoé Ferme' },
        { label: 'Localisation', value: 'Yaoundé, Nkonda, Cameroun' },
        { label: 'Devise', value: 'FCFA (Franc CFA)' },
      ]
    },
    {
      icon: Bell,
      title: 'Alertes stock',
      description: 'Les alertes se déclenchent automatiquement quand un article passe sous son seuil minimum.',
      items: [
        { label: 'Statut', value: '✅ Actif via vues PostgreSQL' },
      ]
    },
    {
      icon: Shield,
      title: 'Sécurité',
      description: 'Authentification et protection des données.',
      items: [
        { label: 'Auth', value: '🔓 Mode développement (désactivé)' },
        { label: 'RLS', value: '✅ Configuré dans Supabase' },
        { label: 'Données', value: 'Chiffrées en transit (HTTPS)' },
      ]
    },
  ]

  return (
    <div className="animate-fade-in">
      <Header title="Paramètres" subtitle="Configuration de l'application Zoé Ferme ERP" />
      <div className="p-6 space-y-4">
        {sections.map(section => (
          <div key={section.title} className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[var(--primary-muted)] flex items-center justify-center">
                <section.icon size={16} className="text-[var(--primary)]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)]">{section.title}</h3>
                <p className="text-xs text-[var(--muted)]">{section.description}</p>
              </div>
            </div>
            <div className="space-y-2">
              {section.items.map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-[var(--card-border)] last:border-0">
                  <span className="text-sm text-[var(--muted-fg)]">{item.label}</span>
                  <span className="text-sm font-medium text-[var(--foreground)] max-w-xs truncate text-right">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-[rgba(34,197,94,0.05)] border border-[rgba(34,197,94,0.2)] rounded-xl p-5 text-center">
          <p className="text-sm text-[var(--primary)] font-medium">Zoé Ferme ERP v1.0.0</p>
          <p className="text-xs text-[var(--muted)] mt-1">Application en cours de développement — Yaoundé, Cameroun 🇨🇲</p>
        </div>
      </div>
    </div>
  )
}
