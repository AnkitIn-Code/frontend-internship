import React, { useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import Icon from '../components/AppIcon';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../components/ui/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const heroRef = useRef(null);

  // If user is already logged in, redirect directly to dashboard
  const authToken = localStorage.getItem('authToken');
  if (authToken) {
    return <Navigate to="/main-dashboard" replace />;
  }

  const features = [
    {
      icon: 'Search',
      title: t('landing.features.discover.title'),
      description: t('landing.features.discover.desc'),
      gradient: 'from-indigo-600 to-indigo-700',
    },
    {
      icon: 'ClipboardList',
      title: t('landing.features.track.title'),
      description: t('landing.features.track.desc'),
      gradient: 'from-violet-600 to-purple-700',
    },
    {
      icon: 'BarChart',
      title: t('landing.features.analytics.title'),
      description: t('landing.features.analytics.desc'),
      gradient: 'from-teal-600 to-emerald-700',
    },
    {
      icon: 'Users',
      title: t('landing.features.community.title'),
      description: t('landing.features.community.desc'),
      gradient: 'from-blue-600 to-indigo-700',
    },
  ];

  return (
    <div className="landing-root">
      {/* ── Ambient subtle background ──────────────────────── */}
      <div className="landing-bg" aria-hidden="true">
        <div className="landing-ambient-top" />
        <div className="landing-ambient-bottom" />
        <div className="grid-overlay" />
      </div>

      {/* ── Navigation ──────────────────────────────────────── */}
      <header className="landing-nav">
        <div className="nav-inner">
          {/* Logo */}
          <div className="nav-logo" onClick={() => navigate('/')} role="button" tabIndex={0}>
            <div className="logo-icon">
              <Icon name="Briefcase" size={17} color="white" />
            </div>
            <span className="logo-text">{t('appTitle')}</span>
          </div>

          {/* Actions */}
          <div className="nav-actions">
            <ThemeToggle />
            <button className="btn-ghost-nav" onClick={() => navigate('/user-login')}>
              {t('nav.login')}
            </button>
            <button className="btn-primary-nav" onClick={() => navigate('/user-registration')}>
              {t('nav.signup')}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-inner">
          <div className="hero-badge">
            <span className="badge-dot" />
            <span>AI-Powered Internship Platform</span>
          </div>

          <h1 className="hero-title">
            {t('landing.hero.title1')}
            <span className="hero-gradient-text"> {t('landing.hero.title2')}</span>
          </h1>

          <p className="hero-desc">{t('landing.hero.description')}</p>

          <div className="hero-actions">
            <button className="btn-cta" onClick={() => navigate('/user-registration')}>
              <span>{t('cta.getStarted')}</span>
              <Icon name="ArrowRight" size={16} />
            </button>
            <button className="btn-cta-outline" onClick={() => navigate('/user-login')}>
              {t('cta.signIn')}
            </button>
          </div>

          {/* Stats row */}
          <div className="hero-stats">
            {[
              { label: 'Students', value: '50K+' },
              { label: 'Companies', value: '1K+' },
              { label: 'Avg. Rating', value: '4.8★' },
            ].map((s) => (
              <div key={s.label} className="stat-item">
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section className="features-section">
        <div className="features-inner">
          <p className="features-eyebrow">{t('landing.features.subtitle')}</p>
          <h2 className="features-title">{t('landing.features.title')}</h2>

          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className={`feature-icon-wrap bg-gradient-to-br ${f.gradient}`}>
                  <Icon name={f.icon} size={18} color="white" />
                </div>
                <h3 className="feature-card-title">{f.title}</h3>
                <p className="feature-card-desc">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────── */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2 className="cta-title">{t('landing.cta.title')}</h2>
          <p className="cta-desc">{t('landing.cta.subtitle')}</p>
          <button className="btn-cta" onClick={() => navigate('/user-registration')}>
            <span>{t('cta.createAccount')}</span>
            <Icon name="ArrowRight" size={16} />
          </button>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <div className="logo-icon logo-icon-sm">
              <Icon name="Briefcase" size={13} color="white" />
            </div>
            <span className="logo-text-sm">{t('appTitle')}</span>
          </div>
          <p className="footer-copy">
            {t('landing.footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>

      {/* ── Scoped styles matching Dashboard ────────────────── */}
      <style>{`
        /* Root & layout — Dark Mode default styles */
        .landing-root {
          position: relative;
          min-height: 100vh;
          background: #0B1120;
          color: #F8FAFC;
          font-family: 'Plus Jakarta Sans', sans-serif;
          overflow-x: hidden;
          transition: background-color 0.2s ease, color 0.2s ease;
        }

        /* Ambient background — calm, subtle, non-distracting */
        .landing-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .landing-ambient-top {
          position: absolute;
          top: -100px;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 400px;
          background: radial-gradient(ellipse at center, rgba(79, 70, 229, 0.09) 0%, transparent 70%);
        }
        .landing-ambient-bottom {
          position: absolute;
          bottom: 0;
          right: 10%;
          width: 600px;
          height: 350px;
          background: radial-gradient(ellipse at center, rgba(99, 102, 241, 0.05) 0%, transparent 70%);
        }
        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(148, 163, 184, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        /* Foreground layers */
        .landing-nav,
        .hero-section,
        .features-section,
        .cta-section,
        .landing-footer {
          position: relative;
          z-index: 1;
        }

        /* ── NAV ── */
        .landing-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          background: rgba(11, 17, 32, 0.85);
          border-bottom: 1px solid #1E293B;
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }
        .nav-inner {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 1.5rem;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          user-select: none;
        }
        .logo-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #4F46E5;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(79, 70, 229, 0.3);
        }
        .logo-icon-sm {
          width: 24px;
          height: 24px;
          border-radius: 6px;
        }
        .logo-text {
          font-size: 1.05rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #FFFFFF;
        }
        .logo-text-sm {
          font-size: 0.9rem;
          font-weight: 600;
          color: #94A3B8;
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .btn-ghost-nav {
          padding: 7px 16px;
          border-radius: 9px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #94A3B8;
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .btn-ghost-nav:hover {
          color: #FFFFFF;
          background: #1E293B;
        }
        .btn-primary-nav {
          padding: 7px 18px;
          border-radius: 9px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #FFFFFF;
          background: #4F46E5;
          border: 1px solid transparent;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(79, 70, 229, 0.25);
          transition: all 0.18s ease;
        }
        .btn-primary-nav:hover {
          background: #4338CA;
        }

        /* ── HERO ── */
        .hero-section {
          padding: 4.5rem 1.5rem 3.5rem;
          text-align: center;
        }
        .hero-inner {
          max-width: 780px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.3rem;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 5px 13px;
          border-radius: 999px;
          background: rgba(79, 70, 229, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.3);
          font-size: 0.75rem;
          font-weight: 600;
          color: #818CF8;
          letter-spacing: 0.02em;
        }
        .badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
        }
        .hero-title {
          font-size: clamp(2.1rem, 5vw, 3.25rem);
          font-weight: 800;
          line-height: 1.16;
          letter-spacing: -0.03em;
          color: #FFFFFF;
          margin: 0;
        }
        .hero-gradient-text {
          background: linear-gradient(135deg, #818CF8 0%, #A78BFA 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-desc {
          font-size: 1.05rem;
          color: #94A3B8;
          max-width: 580px;
          line-height: 1.65;
          margin: 0;
        }
        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
          margin-top: 0.25rem;
        }

        /* Primary CTA button */
        .btn-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          border-radius: 10px;
          font-size: 0.92rem;
          font-weight: 600;
          color: #FFFFFF;
          background: #4F46E5;
          border: 1px solid transparent;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(79, 70, 229, 0.25);
          transition: all 0.18s ease;
        }
        .btn-cta:hover {
          background: #4338CA;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
        }
        .btn-cta:active {
          transform: translateY(0);
        }

        /* Outline CTA button */
        .btn-cta-outline {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          border-radius: 10px;
          font-size: 0.92rem;
          font-weight: 600;
          color: #E2E8F0;
          background: #1E293B;
          border: 1px solid #334155;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .btn-cta-outline:hover {
          background: #334155;
          color: #FFFFFF;
          transform: translateY(-1px);
        }

        /* Stats */
        .hero-stats {
          display: flex;
          gap: 2.5rem;
          margin-top: 1rem;
        }
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
        }
        .stat-value {
          font-size: 1.35rem;
          font-weight: 800;
          color: #F8FAFC;
        }
        .stat-label {
          font-size: 0.75rem;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        /* ── FEATURES ── */
        .features-section {
          padding: 3.5rem 1.5rem 4rem;
        }
        .features-inner {
          max-width: 1080px;
          margin: 0 auto;
          text-align: center;
        }
        .features-eyebrow {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #818CF8;
          margin-bottom: 0.5rem;
        }
        .features-title {
          font-size: clamp(1.5rem, 3vw, 2.1rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #FFFFFF;
          margin-bottom: 2.5rem;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
        }
        .feature-card {
          background: #0F172A;
          border: 1px solid #1E293B;
          border-radius: 16px;
          padding: 1.6rem 1.4rem;
          text-align: left;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
          cursor: default;
        }
        .feature-card:hover {
          transform: translateY(-3px);
          border-color: #334155;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }
        .feature-icon-wrap {
          width: 38px;
          height: 38px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
        .feature-card-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #F8FAFC;
          margin-bottom: 0.4rem;
        }
        .feature-card-desc {
          font-size: 0.84rem;
          color: #94A3B8;
          line-height: 1.55;
          margin: 0;
        }

        /* ── CTA BANNER ── */
        .cta-section {
          padding: 3.5rem 1.5rem;
          background: #0F172A;
          border-top: 1px solid #1E293B;
          border-bottom: 1px solid #1E293B;
        }
        .cta-inner {
          max-width: 620px;
          margin: 0 auto;
          text-align: center;
        }
        .cta-title {
          font-size: clamp(1.4rem, 3vw, 1.95rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #FFFFFF;
          margin-bottom: 0.6rem;
        }
        .cta-desc {
          font-size: 0.95rem;
          color: #94A3B8;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        /* ── FOOTER ── */
        .landing-footer {
          padding: 1.75rem 1.5rem;
          background: #0B1120;
          border-top: 1px solid #1E293B;
        }
        .footer-inner {
          max-width: 1120px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .footer-copy {
          font-size: 0.8rem;
          color: #64748B;
          margin: 0;
        }

        @media (max-width: 540px) {
          .hero-stats { gap: 1.5rem; }
          .footer-inner { justify-content: center; text-align: center; }
        }

        /* ═══════════════════════════════════════════════════════════
           LIGHT MODE — Exactly matches Main Dashboard (#F8FAFC, Slate, White)
        ═══════════════════════════════════════════════════════════ */
        :root:not(.dark) .landing-root {
          background: #F8FAFC;
          color: #0F172A;
        }
        :root:not(.dark) .landing-ambient-top {
          background: radial-gradient(ellipse at center, rgba(79, 70, 229, 0.05) 0%, transparent 70%);
        }
        :root:not(.dark) .landing-ambient-bottom {
          background: radial-gradient(ellipse at center, rgba(148, 163, 184, 0.08) 0%, transparent 70%);
        }
        :root:not(.dark) .grid-overlay {
          background-image:
            linear-gradient(rgba(203, 213, 225, 0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(203, 213, 225, 0.4) 1px, transparent 1px);
        }
        /* Nav in light mode */
        :root:not(.dark) .landing-nav {
          background: rgba(255, 255, 255, 0.85);
          border-bottom: 1px solid #E2E8F0;
        }
        :root:not(.dark) .logo-text {
          color: #0F172A;
        }
        :root:not(.dark) .logo-text-sm {
          color: #475569;
        }
        :root:not(.dark) .btn-ghost-nav {
          color: #475569;
        }
        :root:not(.dark) .btn-ghost-nav:hover {
          color: #0F172A;
          background: #F1F5F9;
        }
        /* Hero in light mode */
        :root:not(.dark) .hero-title {
          color: #0F172A;
        }
        :root:not(.dark) .hero-gradient-text {
          background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        :root:not(.dark) .hero-desc {
          color: #64748B;
        }
        :root:not(.dark) .hero-badge {
          background: #EEF2FF;
          border-color: #C7D2FE;
          color: #4F46E5;
        }
        :root:not(.dark) .btn-cta-outline {
          background: #FFFFFF;
          border-color: #E2E8F0;
          color: #334155;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }
        :root:not(.dark) .btn-cta-outline:hover {
          background: #F1F5F9;
          border-color: #CBD5E1;
          color: #0F172A;
        }
        :root:not(.dark) .stat-value {
          color: #0F172A;
        }
        :root:not(.dark) .stat-label {
          color: #64748B;
        }
        /* Features in light mode */
        :root:not(.dark) .features-eyebrow {
          color: #4F46E5;
        }
        :root:not(.dark) .features-title {
          color: #0F172A;
        }
        :root:not(.dark) .feature-card {
          background: #FFFFFF;
          border-color: #E2E8F0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }
        :root:not(.dark) .feature-card:hover {
          border-color: #CBD5E1;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
        }
        :root:not(.dark) .feature-card-title {
          color: #0F172A;
        }
        :root:not(.dark) .feature-card-desc {
          color: #64748B;
        }
        /* CTA Banner in light mode */
        :root:not(.dark) .cta-section {
          background: #FFFFFF;
          border-top-color: #E2E8F0;
          border-bottom-color: #E2E8F0;
        }
        :root:not(.dark) .cta-title {
          color: #0F172A;
        }
        :root:not(.dark) .cta-desc {
          color: #64748B;
        }
        /* Footer in light mode */
        :root:not(.dark) .landing-footer {
          background: #F8FAFC;
          border-top-color: #E2E8F0;
        }
        :root:not(.dark) .footer-copy {
          color: #64748B;
        }
      `}</style>
    </div>
  );
};

export default Landing;
