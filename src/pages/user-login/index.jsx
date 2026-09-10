import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import MockCredentialsInfo from './components/MockCredentialsInfo';
import Icon from '../../components/AppIcon';
import ThemeToggle from '../../components/ui/ThemeToggle';

const UserLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) navigate('/main-dashboard');
  }, [navigate]);

  return (
    <div className="auth-root">
      {/* Ambient background — calm subtle grid & gradient */}
      <div className="auth-bg" aria-hidden="true">
        <div className="auth-ambient-top" />
        <div className="auth-ambient-bottom" />
        <div className="auth-grid" />
      </div>

      {/* Back to home + theme toggle row */}
      <div className="auth-top-bar">
        <button className="auth-back-btn" onClick={() => navigate('/')}>
          <Icon name="ArrowLeft" size={16} />
          <span>Back to Home</span>
        </button>
        <ThemeToggle />
      </div>

      {/* Card */}
      <main className="auth-center">
        <div className="auth-card animate-slide-up">
          {/* Header */}
          <div className="auth-card-header">
            <div className="auth-logo" onClick={() => navigate('/')} role="button" tabIndex={0}>
              <div className="auth-logo-icon">
                <Icon name="Briefcase" size={20} color="white" />
              </div>
            </div>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to your InternGuide AI account</p>
          </div>

          {/* Form */}
          <LoginForm />

          {/* Footer link */}
          <div className="auth-card-footer">
            <span className="auth-footer-text">New to InternGuide AI?</span>
            <button className="auth-footer-link" onClick={() => navigate('/user-registration')}>
              Create account
            </button>
          </div>
        </div>

        {/* Dev mock creds */}
        {import.meta.env.DEV && <MockCredentialsInfo />}
      </main>

      <style>{`
        .auth-root {
          position: relative;
          min-height: 100vh;
          background: #0B1120;
          color: #F8FAFC;
          font-family: 'Plus Jakarta Sans', sans-serif;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: background-color 0.2s ease, color 0.2s ease;
        }
        .auth-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .auth-ambient-top {
          position: absolute;
          top: -120px;
          left: 50%;
          transform: translateX(-50%);
          width: 700px;
          height: 350px;
          background: radial-gradient(ellipse at center, rgba(79, 70, 229, 0.08) 0%, transparent 70%);
        }
        .auth-ambient-bottom {
          position: absolute;
          bottom: 0;
          right: 5%;
          width: 500px;
          height: 300px;
          background: radial-gradient(ellipse at center, rgba(99, 102, 241, 0.05) 0%, transparent 70%);
        }
        .auth-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(148, 163, 184, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        /* Top bar (back btn + theme toggle) */
        .auth-top-bar {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.75rem 0;
        }
        .auth-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 9px;
          background: #1E293B;
          border: 1px solid #334155;
          color: #CBD5E1;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .auth-back-btn:hover {
          background: #334155;
          color: #FFFFFF;
          transform: translateY(-1px);
        }

        /* Center */
        .auth-center {
          position: relative;
          z-index: 1;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        /* Card */
        .auth-card {
          width: 100%;
          max-width: 440px;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid #1E293B;
          border-radius: 20px;
          padding: 2.2rem 2rem;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
          transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }

        /* Card header */
        .auth-card-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.5rem;
          margin-bottom: 1.75rem;
        }
        .auth-logo {
          cursor: pointer;
          margin-bottom: 0.2rem;
        }
        .auth-logo-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #4F46E5;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(79, 70, 229, 0.3);
          transition: transform 0.2s;
        }
        .auth-logo-icon:hover { transform: scale(1.05); }
        .auth-title {
          font-size: 1.45rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #FFFFFF;
          margin: 0;
        }
        .auth-subtitle {
          font-size: 0.875rem;
          color: #94A3B8;
          margin: 0;
        }

        /* Card footer */
        .auth-card-footer {
          margin-top: 1.5rem;
          padding-top: 1.25rem;
          border-top: 1px solid #1E293B;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
        }
        .auth-footer-text {
          font-size: 0.85rem;
          color: #94A3B8;
        }
        .auth-footer-link {
          font-size: 0.85rem;
          font-weight: 600;
          color: #818CF8;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
          padding: 0;
        }
        .auth-footer-link:hover { color: #A78BFA; text-decoration: underline; }

        /* ═══════════════════════════════════════════════════════════
           LIGHT MODE OVERRIDES — Clean Main Dashboard Slate & White
        ═══════════════════════════════════════════════════════════ */
        :root:not(.dark) .auth-root {
          background: #F8FAFC;
          color: #0F172A;
        }
        :root:not(.dark) .auth-ambient-top {
          background: radial-gradient(ellipse at center, rgba(79, 70, 229, 0.05) 0%, transparent 70%);
        }
        :root:not(.dark) .auth-ambient-bottom {
          background: radial-gradient(ellipse at center, rgba(148, 163, 184, 0.08) 0%, transparent 70%);
        }
        :root:not(.dark) .auth-grid {
          background-image:
            linear-gradient(rgba(203, 213, 225, 0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(203, 213, 225, 0.4) 1px, transparent 1px);
        }
        :root:not(.dark) .auth-back-btn {
          background: #FFFFFF;
          border-color: #E2E8F0;
          color: #475569;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }
        :root:not(.dark) .auth-back-btn:hover {
          background: #F1F5F9;
          border-color: #CBD5E1;
          color: #0F172A;
        }
        :root:not(.dark) .auth-card {
          background: #FFFFFF;
          border-color: #E2E8F0;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
        }
        :root:not(.dark) .auth-title {
          color: #0F172A;
        }
        :root:not(.dark) .auth-subtitle {
          color: #64748B;
        }
        :root:not(.dark) .auth-card-footer {
          border-top-color: #E2E8F0;
        }
        :root:not(.dark) .auth-footer-text {
          color: #64748B;
        }
        :root:not(.dark) .auth-footer-link {
          color: #4F46E5;
        }
        :root:not(.dark) .auth-footer-link:hover {
          color: #4338CA;
        }
      `}</style>
    </div>
  );
};

export default UserLogin;