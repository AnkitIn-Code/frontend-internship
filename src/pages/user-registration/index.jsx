import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import Icon from '../../components/AppIcon';
import ThemeToggle from '../../components/ui/ThemeToggle';

const UserRegistration = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) navigate('/main-dashboard');
  }, [navigate]);

  const perks = [
    { icon: 'Zap', label: 'AI-Powered Matching', color: '#6366F1' },
    { icon: 'Target', label: 'Application Tracker', color: '#8B5CF6' },
    { icon: 'TrendingUp', label: 'Career Analytics', color: '#0EA5E9' },
    { icon: 'Shield', label: 'Privacy First', color: '#10B981' },
  ];

  return (
    <>
      <Helmet>
        <title>Create Account - InternGuide AI</title>
        <meta name="description" content="Join InternGuide AI and discover your perfect internship with AI-powered recommendations. Create your free account today." />
        <meta name="keywords" content="internship, registration, student account, career, AI matching" />
      </Helmet>

      <div className="reg-root">
        {/* Ambient subtle background */}
        <div className="reg-bg" aria-hidden="true">
          <div className="reg-ambient-top" />
          <div className="reg-ambient-bottom" />
          <div className="reg-grid" />
        </div>

        {/* Back btn + theme toggle */}
        <div className="reg-top-bar">
          <button className="reg-back-btn" onClick={() => navigate('/')}>
            <Icon name="ArrowLeft" size={16} />
            <span>Back to Home</span>
          </button>
          <ThemeToggle />
        </div>

        {/* Two-column layout */}
        <div className="reg-layout">
          {/* Left: branding panel (desktop only) */}
          <aside className="reg-panel" aria-hidden="true">
            <div className="panel-inner">
              <div className="panel-logo">
                <div className="panel-logo-icon">
                  <Icon name="Briefcase" size={24} color="white" />
                </div>
                <span className="panel-logo-text">InternGuide AI</span>
              </div>

              <div className="panel-headline">
                <h2 className="panel-h2">Land your dream internship <span className="panel-accent">faster</span></h2>
                <p className="panel-p">Join 50,000+ students who found their perfect role using our AI-powered platform.</p>
              </div>

              {/* Perks */}
              <ul className="panel-perks">
                {perks.map((p) => (
                  <li key={p.label} className="panel-perk">
                    <div className="perk-icon" style={{ color: p.color }}>
                      <Icon name={p.icon} size={15} />
                    </div>
                    <span>{p.label}</span>
                  </li>
                ))}
              </ul>

              {/* Steps */}
              <div className="panel-steps">
                <p className="steps-label">Quick setup — under 2 minutes</p>
                <div className="steps-list">
                  {['Create account', 'Complete profile', 'Get matched'].map((s, i) => (
                    <div key={i} className="step-item">
                      <div className="step-num">{i + 1}</div>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="panel-stats">
                {[
                  { v: '50K+', l: 'Students' },
                  { v: '1K+', l: 'Companies' },
                  { v: '4.8★', l: 'Rating' },
                ].map((s) => (
                  <div key={s.l} className="panel-stat">
                    <span className="ps-value">{s.v}</span>
                    <span className="ps-label">{s.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Right: form */}
          <main className="reg-form-col">
            <div className="reg-card animate-slide-up">
              {/* Mobile logo */}
              <div className="reg-mobile-logo">
                <div className="panel-logo-icon panel-logo-icon-sm">
                  <Icon name="Briefcase" size={17} color="white" />
                </div>
                <span className="panel-logo-text">InternGuide AI</span>
              </div>

              <div className="reg-card-header">
                <h1 className="reg-title">Create your account</h1>
                <p className="reg-subtitle">Start your internship journey today</p>
              </div>

              <RegistrationForm />

              <div className="reg-card-footer">
                <span className="reg-footer-text">Already have an account?</span>
                <button className="reg-footer-link" onClick={() => navigate('/user-login')}>
                  Sign in here
                </button>
              </div>
            </div>
          </main>
        </div>

        <style>{`
          .reg-root {
            position: relative;
            min-height: 100vh;
            background: #0B1120;
            color: #F8FAFC;
            font-family: 'Plus Jakarta Sans', sans-serif;
            display: flex;
            flex-direction: column;
            overflow-x: hidden;
            transition: background-color 0.2s ease, color 0.2s ease;
          }
          .reg-bg {
            position: fixed; inset: 0;
            pointer-events: none; z-index: 0;
          }
          .reg-ambient-top {
            position: absolute;
            top: -120px;
            left: 50%;
            transform: translateX(-50%);
            width: 800px;
            height: 400px;
            background: radial-gradient(ellipse at center, rgba(79, 70, 229, 0.08) 0%, transparent 70%);
          }
          .reg-ambient-bottom {
            position: absolute;
            bottom: 0;
            right: 5%;
            width: 600px;
            height: 350px;
            background: radial-gradient(ellipse at center, rgba(99, 102, 241, 0.05) 0%, transparent 70%);
          }
          .reg-grid {
            position: absolute; inset: 0;
            background-image:
              linear-gradient(rgba(148, 163, 184, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148, 163, 184, 0.03) 1px, transparent 1px);
            background-size: 40px 40px;
          }

          /* Top bar */
          .reg-top-bar {
            position: relative; z-index: 10;
            display: flex; align-items: center;
            justify-content: space-between;
            padding: 1.25rem 1.75rem 0;
          }
          .reg-back-btn {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 7px 14px; border-radius: 9px;
            background: #1E293B;
            border: 1px solid #334155;
            color: #CBD5E1;
            font-size: 0.82rem; font-weight: 600;
            cursor: pointer; transition: all 0.18s ease;
          }
          .reg-back-btn:hover { background: #334155; color: #FFFFFF; transform: translateY(-1px); }

          /* Layout */
          .reg-layout {
            position: relative; z-index: 1;
            flex: 1; display: flex; min-height: 0;
          }

          /* Left panel */
          .reg-panel {
            display: none;
            width: 420px; flex-shrink: 0;
            background: rgba(15, 23, 42, 0.7);
            border-right: 1px solid #1E293B;
            padding: 2.5rem 2.25rem;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
          }
          @media (min-width: 960px) { .reg-panel { display: flex; align-items: center; } }
          .panel-inner { width: 100%; display: flex; flex-direction: column; gap: 1.75rem; }

          .panel-logo { display: flex; align-items: center; gap: 10px; }
          .panel-logo-icon {
            width: 40px; height: 40px; border-radius: 11px;
            background: #4F46E5;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 1px 3px rgba(79, 70, 229, 0.3);
          }
          .panel-logo-icon-sm { width: 32px; height: 32px; border-radius: 8px; }
          .panel-logo-text {
            font-size: 1.05rem; font-weight: 800;
            letter-spacing: -0.02em; color: #FFFFFF;
          }

          .panel-headline { display: flex; flex-direction: column; gap: 0.4rem; }
          .panel-h2 {
            font-size: 1.55rem; font-weight: 800;
            letter-spacing: -0.03em; color: #FFFFFF; line-height: 1.25;
            margin: 0;
          }
          .panel-accent {
            background: linear-gradient(135deg, #818CF8, #A78BFA);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .panel-p { font-size: 0.875rem; color: #94A3B8; line-height: 1.6; margin: 0; }

          /* Perks */
          .panel-perks { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.65rem; }
          .panel-perk {
            display: flex; align-items: center; gap: 10px;
            font-size: 0.85rem; color: #E2E8F0; font-weight: 500;
          }
          .perk-icon {
            width: 28px; height: 28px; border-radius: 8px;
            background: #1E293B;
            border: 1px solid #334155;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
          }

          /* Steps */
          .panel-steps { display: flex; flex-direction: column; gap: 0.5rem; }
          .steps-label { font-size: 0.72rem; color: #818CF8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin: 0; }
          .steps-list { display: flex; flex-direction: column; gap: 0.45rem; }
          .step-item { display: flex; align-items: center; gap: 10px; font-size: 0.84rem; color: #94A3B8; }
          .step-num {
            width: 20px; height: 20px; border-radius: 50%;
            background: #4F46E5;
            display: flex; align-items: center; justify-content: center;
            font-size: 0.68rem; font-weight: 700; color: #fff; flex-shrink: 0;
          }

          /* Panel stats */
          .panel-stats { display: flex; gap: 1.5rem; padding-top: 1rem; border-top: 1px solid #1E293B; }
          .panel-stat { display: flex; flex-direction: column; gap: 2px; }
          .ps-value { font-size: 1.15rem; font-weight: 800; color: #F8FAFC; }
          .ps-label { font-size: 0.72rem; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }

          /* Right form col */
          .reg-form-col {
            flex: 1; display: flex; align-items: center; justify-content: center;
            padding: 2rem 1.5rem 3rem;
            overflow-y: auto;
          }

          /* Card */
          .reg-card {
            width: 100%; max-width: 460px;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
            border: 1px solid #1E293B;
            border-radius: 20px;
            padding: 2rem 1.85rem;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
            transition: background-color 0.2s ease, border-color 0.2s ease;
          }

          /* Mobile logo (hidden on desktop) */
          .reg-mobile-logo {
            display: flex; align-items: center; gap: 9px;
            margin-bottom: 1.25rem;
          }
          @media (min-width: 960px) { .reg-mobile-logo { display: none; } }

          .reg-card-header { margin-bottom: 1.4rem; }
          .reg-title {
            font-size: 1.4rem; font-weight: 800;
            letter-spacing: -0.02em; color: #FFFFFF; margin: 0 0 0.3rem;
          }
          .reg-subtitle { font-size: 0.85rem; color: #94A3B8; margin: 0; }

          .reg-card-footer {
            margin-top: 1.3rem; padding-top: 1.1rem;
            border-top: 1px solid #1E293B;
            display: flex; justify-content: center; align-items: center; gap: 6px;
          }
          .reg-footer-text { font-size: 0.85rem; color: #94A3B8; }
          .reg-footer-link {
            font-size: 0.85rem; font-weight: 600; color: #818CF8;
            background: none; border: none; cursor: pointer;
            padding: 0; transition: color 0.18s;
          }
          .reg-footer-link:hover { color: #A78BFA; text-decoration: underline; }

          /* ═══════════════════════════════════════════════════════════
             LIGHT MODE OVERRIDES — Slate & White matching Dashboard
          ═══════════════════════════════════════════════════════════ */
          :root:not(.dark) .reg-root {
            background: #F8FAFC;
            color: #0F172A;
          }
          :root:not(.dark) .reg-ambient-top {
            background: radial-gradient(ellipse at center, rgba(79, 70, 229, 0.05) 0%, transparent 70%);
          }
          :root:not(.dark) .reg-ambient-bottom {
            background: radial-gradient(ellipse at center, rgba(148, 163, 184, 0.08) 0%, transparent 70%);
          }
          :root:not(.dark) .reg-grid {
            background-image:
              linear-gradient(rgba(203, 213, 225, 0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(203, 213, 225, 0.4) 1px, transparent 1px);
          }
          :root:not(.dark) .reg-back-btn {
            background: #FFFFFF;
            border-color: #E2E8F0;
            color: #475569;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
          }
          :root:not(.dark) .reg-back-btn:hover {
            background: #F1F5F9;
            border-color: #CBD5E1;
            color: #0F172A;
          }
          :root:not(.dark) .reg-panel {
            background: #FFFFFF;
            border-right-color: #E2E8F0;
          }
          :root:not(.dark) .panel-logo-text { color: #0F172A; }
          :root:not(.dark) .panel-h2 { color: #0F172A; }
          :root:not(.dark) .panel-accent {
            background: linear-gradient(135deg, #4F46E5, #7C3AED);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          }
          :root:not(.dark) .panel-p { color: #64748B; }
          :root:not(.dark) .panel-perk { color: #334155; }
          :root:not(.dark) .perk-icon {
            background: #F1F5F9;
            border-color: #E2E8F0;
          }
          :root:not(.dark) .steps-label { color: #4F46E5; }
          :root:not(.dark) .step-item { color: #64748B; }
          :root:not(.dark) .panel-stats { border-top-color: #E2E8F0; }
          :root:not(.dark) .ps-value { color: #0F172A; }
          :root:not(.dark) .ps-label { color: #64748B; }
          :root:not(.dark) .reg-card {
            background: #FFFFFF;
            border-color: #E2E8F0;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
          }
          :root:not(.dark) .reg-title { color: #0F172A; }
          :root:not(.dark) .reg-subtitle { color: #64748B; }
          :root:not(.dark) .reg-card-footer { border-top-color: #E2E8F0; }
          :root:not(.dark) .reg-footer-text { color: #64748B; }
          :root:not(.dark) .reg-footer-link { color: #4F46E5; }
          :root:not(.dark) .reg-footer-link:hover { color: #4338CA; }
        `}</style>
      </div>
    </>
  );
};

export default UserRegistration;