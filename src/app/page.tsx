'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function HomePage() {
  const router = useRouter()
  const [loaded, setLoaded] = useState(false)
  const [entering, setEntering] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(t)
  }, [])

  const handleEnter = () => {
    setEntering(true)
    setTimeout(() => router.push('/dashboard'), 700)
  }

  return (
    <main className="landing-root">
      {/* Image de fond */}
      <div className={`landing-bg${loaded ? ' loaded' : ''}`}>
        <Image
          src="/poulets-ferme.png"
          alt="Bâtiment d'élevage moderne Zoé Ferme"
          fill
          priority
          quality={95}
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
        <div className="landing-overlay" />
        <div className="landing-particles">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="particle"
              style={{ '--i': i } as React.CSSProperties}
            />
          ))}
        </div>
      </div>

      {/* Contenu central */}
      <div className={`landing-content${loaded ? ' visible' : ''}${entering ? ' exit' : ''}`}>
        <div className="landing-badge">
          <span className="badge-dot" />
          Système de Gestion Avicole
        </div>

        <div className="landing-logo">🐔</div>

        <h1 className="landing-title">
          Zoé Ferme
          <span className="landing-title-erp"> ERP</span>
        </h1>

        <p className="landing-subtitle">
          Pilotez votre exploitation avicole avec précision.<br />
          Yaoundé, Cameroun.
        </p>

        <div className="landing-stats">
          <div className="stat-item">
            <span className="stat-value">100%</span>
            <span className="stat-label">Numérique</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">Temps réel</span>
            <span className="stat-label">Suivi des lots</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">14</span>
            <span className="stat-label">Modules actifs</span>
          </div>
        </div>

        <button
          id="btn-enter-dashboard"
          className="landing-btn"
          onClick={handleEnter}
        >
          <span>Accéder au tableau de bord</span>
          <span className="btn-arrow">→</span>
        </button>
      </div>

      {/* Footer discret */}
      <div className={`landing-footer${loaded ? ' visible' : ''}`}>
        © {new Date().getFullYear()} Zoé Ferme · Gestion avicole professionnelle
      </div>
    </main>
  )
}
