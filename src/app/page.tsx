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
      <div className={`landing-bg ${loaded ? 'loaded' : ''}`}>
        <Image
          src="/poulets-ferme.png"
          alt="Bâtiment d'élevage moderne Zoé Ferme"
          fill
          priority
          quality={95}
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
        {/* Overlay gradient sombre */}
        <div className="landing-overlay" />
        {/* Particules animées */}
        <div className="landing-particles">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="particle" style={{ '--i': i } as React.CSSProperties} />
          ))}
        </div>
      </div>

      {/* Contenu central */}
      <div className={`landing-content ${loaded ? 'visible' : ''} ${entering ? 'exit' : ''}`}>
        {/* Badge */}
        <div className="landing-badge">
          <span className="badge-dot" />
          Système de Gestion Avicole
        </div>

        {/* Logo / Titre */}
        <div className="landing-logo">
          <span className="logo-icon">🐔</span>
        </div>

        <h1 className="landing-title">
          Zoé Ferme
          <span className="landing-title-erp"> ERP</span>
        </h1>

        <p className="landing-subtitle">
          Pilotez votre exploitation avicole avec précision.<br />
          Yaoundé, Cameroun.
        </p>

        {/* Stats rapides */}
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

        {/* Bouton d'entrée */}
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
      <div className={`landing-footer ${loaded ? 'visible' : ''}`}>
        © {new Date().getFullYear()} Zoé Ferme · Gestion avicole professionnelle
      </div>

      <style jsx>{`
        .landing-root {
          position: fixed;
          inset: 0;
          overflow: hidden;
          background: #0a0c10;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ── IMAGE DE FOND ── */
        .landing-bg {
          position: absolute;
          inset: 0;
          opacity: 0;
          transform: scale(1.05);
          transition: opacity 1.4s ease, transform 6s ease;
        }
        .landing-bg.loaded {
          opacity: 1;
          transform: scale(1.02);
          animation: slowZoom 20s ease-in-out infinite alternate;
        }

        @keyframes slowZoom {
          from { transform: scale(1.02); }
          to   { transform: scale(1.08); }
        }

        .landing-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(8, 10, 16, 0.82) 0%,
            rgba(8, 10, 16, 0.55) 50%,
            rgba(8, 10, 16, 0.78) 100%
          );
        }

        /* ── PARTICULES ── */
        .landing-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .particle {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(34, 197, 94, 0.6);
          left: calc(var(--i) * 8.5% + 2%);
          top: 110%;
          animation: floatUp calc(8s + var(--i) * 1.1s) ease-in-out infinite;
          animation-delay: calc(var(--i) * 0.7s);
        }
        @keyframes floatUp {
          0%   { top: 110%; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.3; }
          100% { top: -10%; opacity: 0; }
        }

        /* ── CONTENU ── */
        .landing-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1.5rem;
          padding: 2rem;
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.8s ease 0.6s, transform 0.8s ease 0.6s;
        }
        .landing-content.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .landing-content.exit {
          opacity: 0;
          transform: scale(1.04);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        /* Badge */
        .landing-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 1rem;
          border-radius: 9999px;
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #22c55e;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .badge-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          animation: pulseDot 2s ease-in-out infinite;
        }
        @keyframes pulseDot {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
          50%       { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
        }

        /* Logo icone */
        .landing-logo {
          font-size: 4.5rem;
          line-height: 1;
          filter: drop-shadow(0 0 24px rgba(34,197,94,0.4));
          animation: floatIcon 4s ease-in-out infinite;
        }
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }

        /* Titre */
        .landing-title {
          font-size: clamp(2.8rem, 7vw, 5.5rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #f0f2f5;
          margin: 0;
          line-height: 1.05;
          text-shadow: 0 4px 32px rgba(0,0,0,0.6);
        }
        .landing-title-erp {
          color: #22c55e;
          margin-left: 0.15em;
        }

        /* Sous-titre */
        .landing-subtitle {
          font-size: clamp(1rem, 2.2vw, 1.2rem);
          color: rgba(240,242,245,0.7);
          line-height: 1.7;
          margin: 0;
          max-width: 480px;
        }

        /* Stats */
        .landing-stats {
          display: flex;
          align-items: center;
          gap: 2rem;
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 1rem 2rem;
        }
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.2rem;
        }
        .stat-value {
          font-size: 1.1rem;
          font-weight: 700;
          color: #22c55e;
        }
        .stat-label {
          font-size: 0.72rem;
          color: rgba(240,242,245,0.55);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .stat-divider {
          width: 1px;
          height: 36px;
          background: rgba(255,255,255,0.12);
        }

        /* Bouton */
        .landing-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.9rem 2.2rem;
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: #fff;
          box-shadow: 0 8px 32px rgba(34,197,94,0.35), 0 0 0 0 rgba(34,197,94,0.4);
          transition: transform 0.2s, box-shadow 0.2s;
          animation: btnPulse 3s ease-in-out infinite;
        }
        .landing-btn:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 12px 40px rgba(34,197,94,0.5);
          animation: none;
        }
        .landing-btn:active {
          transform: scale(0.97);
        }
        .btn-arrow {
          font-size: 1.2rem;
          transition: transform 0.2s;
        }
        .landing-btn:hover .btn-arrow {
          transform: translateX(5px);
        }
        @keyframes btnPulse {
          0%, 100% { box-shadow: 0 8px 32px rgba(34,197,94,0.35), 0 0 0 0 rgba(34,197,94,0.3); }
          50%       { box-shadow: 0 8px 32px rgba(34,197,94,0.45), 0 0 0 12px rgba(34,197,94,0); }
        }

        /* Footer */
        .landing-footer {
          position: absolute;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.72rem;
          color: rgba(240,242,245,0.35);
          letter-spacing: 0.04em;
          opacity: 0;
          transition: opacity 1s ease 1.5s;
          white-space: nowrap;
          z-index: 10;
        }
        .landing-footer.visible {
          opacity: 1;
        }

        @media (max-width: 480px) {
          .landing-stats {
            gap: 1rem;
            padding: 0.8rem 1.2rem;
          }
          .stat-divider { display: none; }
        }
      `}</style>
    </main>
  )
}
