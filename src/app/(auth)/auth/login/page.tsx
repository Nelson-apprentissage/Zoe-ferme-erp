'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // 🔓 Mode développement — accès direct sans vérification
    await new Promise(r => setTimeout(r, 500))
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--primary)] mb-4">
            <span className="text-white font-bold text-xl">ZF</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Zoé Ferme ERP</h1>
          <p className="text-[var(--muted)] text-sm mt-1">Connectez-vous à votre espace</p>
        </div>

        {/* Form */}
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-8">
          <div className="mb-5 p-3 rounded-lg bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)]">
            <p className="text-xs text-[var(--primary)] text-center">
              🔓 Mode développement — entrez n&apos;importe quoi
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Adresse email
              </label>
              <input
                type="email"
                placeholder="votre@email.com"
                defaultValue="admin@zoeferme.cm"
                className="input"
                id="login-email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Mot de passe
              </label>
              <input
                type="password"
                placeholder="••••••••"
                defaultValue="password"
                className="input"
                id="login-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full justify-center py-2.5"
              id="login-submit"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Connexion...</>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--muted)] mt-6">
            Pas encore de compte ?{' '}
            <Link href="/auth/register" className="text-[var(--primary)] hover:underline font-medium">
              Créer un compte
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-[var(--muted)] mt-6">
          © {new Date().getFullYear()} Zoé Ferme — Yaoundé, Cameroun
        </p>
      </div>
    </div>
  )
}

