import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { authAPI } from '../../../services/api';
import { useTranslation } from 'react-i18next';

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  const validateForm = () => {
    const newErrors = {};
    if (!formData?.email?.trim()) {
      newErrors.email = t('login.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData?.email)) {
      newErrors.email = t('login.errors.emailInvalid');
    }
    if (!formData?.password?.trim()) {
      newErrors.password = t('login.errors.passwordRequired');
    } else if (formData?.password?.length < 6) {
      newErrors.password = t('login.errors.passwordLength');
    }
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors?.[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await authAPI.login({ email: formData?.email, password: formData?.password });
      if (!response?.token) {
        setErrors({ general: response?.message || t('login.errors.invalidCredentials') });
        return;
      }
      localStorage.setItem('authToken', response?.token);
      if (response?.user) localStorage.setItem('user', JSON.stringify(response?.user));
      if (formData?.rememberMe) {
        localStorage.setItem('rememberUser', 'true');
        localStorage.setItem('userEmail', formData?.email);
      }
      const target = location?.state?.from?.pathname || '/main-dashboard';
      navigate(target, { replace: true });
    } catch (error) {
      setErrors({ general: t('login.errors.generic') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => alert(t('login.forgotPasswordAlert'));

  return (
    <>
      <form onSubmit={handleSubmit} className="lf-form">
        {/* General error */}
        {errors?.general && (
          <div className="lf-error-banner">
            <Icon name="AlertCircle" size={15} />
            <span>{errors?.general}</span>
          </div>
        )}

        {/* Email */}
        <div className="lf-field">
          <label className="lf-label" htmlFor="lf-email">
            {t('login.email')}
          </label>
          <div className={`lf-input-wrap ${errors?.email ? 'lf-input-error' : ''}`}>
            <Icon name="Mail" size={16} className="lf-input-icon" />
            <input
              id="lf-email"
              type="email"
              name="email"
              placeholder={t('login.emailPlaceholder')}
              value={formData?.email}
              onChange={handleInputChange}
              autoComplete="email"
              required
              className="lf-input"
            />
          </div>
          {errors?.email && <p className="lf-field-error">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="lf-field">
          <label className="lf-label" htmlFor="lf-password">
            {t('login.password')}
          </label>
          <div className={`lf-input-wrap ${errors?.password ? 'lf-input-error' : ''}`}>
            <Icon name="Lock" size={16} className="lf-input-icon" />
            <input
              id="lf-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder={t('login.passwordPlaceholder')}
              value={formData?.password}
              onChange={handleInputChange}
              autoComplete="current-password"
              required
              className="lf-input"
            />
            <button
              type="button"
              className="lf-toggle-pw"
              onClick={() => setShowPassword(v => !v)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={15} />
            </button>
          </div>
          {errors?.password && <p className="lf-field-error">{errors.password}</p>}
        </div>

        {/* Remember me / Forgot */}
        <div className="lf-row">
          <label className="lf-check-label">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData?.rememberMe}
              onChange={handleInputChange}
              className="lf-checkbox"
            />
            <span>{t('login.rememberMe')}</span>
          </label>
          <button type="button" className="lf-forgot" onClick={handleForgotPassword}>
            {t('login.forgotPassword')}
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="lf-submit"
          id="login-submit-btn"
        >
          {isLoading ? (
            <>
              <span className="lf-spinner" />
              {t('login.signingIn')}
            </>
          ) : (
            <>
              <Icon name="LogIn" size={17} />
              {t('login.signIn')}
            </>
          )}
        </button>
      </form>

      <style>{`
        .lf-form { display: flex; flex-direction: column; gap: 1.1rem; }

        /* Error banner */
        .lf-error-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 10px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #f87171;
          font-size: 0.82rem;
        }

        /* Field */
        .lf-field { display: flex; flex-direction: column; gap: 6px; }
        .lf-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: #cbd5e1;
          letter-spacing: 0.01em;
        }

        /* Input wrap */
        .lf-input-wrap {
          display: flex;
          align-items: center;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 10px;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
          overflow: hidden;
        }
        .lf-input-wrap:focus-within {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }
        .lf-input-wrap.lf-input-error {
          border-color: #ef4444;
        }
        .lf-input-wrap.lf-input-error:focus-within {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
        }

        .lf-input-icon {
          flex-shrink: 0;
          margin-left: 12px;
          color: #64748b !important;
        }
        .lf-input {
          flex: 1;
          padding: 10px 12px;
          background: transparent;
          border: none;
          outline: none;
          color: #f8fafc;
          font-size: 0.875rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .lf-input::placeholder { color: #64748b; }

        .lf-toggle-pw {
          flex-shrink: 0;
          padding: 0 12px;
          height: 100%;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #64748b;
          transition: color 0.18s;
          display: flex; align-items: center;
        }
        .lf-toggle-pw:hover { color: #cbd5e1; }

        .lf-field-error {
          font-size: 0.78rem;
          color: #f87171;
          margin: 0;
        }

        /* Row */
        .lf-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .lf-check-label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 0.82rem;
          color: #94a3b8;
          cursor: pointer;
          user-select: none;
        }
        .lf-checkbox {
          width: 15px; height: 15px;
          accent-color: #4f46e5;
          cursor: pointer;
        }
        .lf-forgot {
          font-size: 0.82rem;
          font-weight: 600;
          color: #818cf8;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: color 0.18s;
        }
        .lf-forgot:hover { color: #a78bfa; text-decoration: underline; }

        /* Submit */
        .lf-submit {
          margin-top: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 10px;
          font-size: 0.92rem;
          font-weight: 600;
          color: #ffffff;
          background: #4f46e5;
          border: none;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(79, 70, 229, 0.25);
          transition: all 0.18s ease;
        }
        .lf-submit:hover:not(:disabled) {
          background: #4338ca;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
        }
        .lf-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Spinner */
        .lf-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spinIt 0.7s linear infinite;
        }
        @keyframes spinIt { to { transform: rotate(360deg); } }

        /* ═══ LIGHT MODE OVERRIDES ═══ */
        :root:not(.dark) .lf-label { color: #334155; }
        :root:not(.dark) .lf-input-wrap {
          background: #ffffff;
          border-color: #cbd5e1;
        }
        :root:not(.dark) .lf-input-wrap:focus-within {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
        }
        :root:not(.dark) .lf-input { color: #0f172a; }
        :root:not(.dark) .lf-input::placeholder { color: #94a3b8; }
        :root:not(.dark) .lf-input-icon { color: #94a3b8 !important; }
        :root:not(.dark) .lf-toggle-pw { color: #94a3b8; }
        :root:not(.dark) .lf-toggle-pw:hover { color: #0f172a; }
        :root:not(.dark) .lf-check-label { color: #64748b; }
        :root:not(.dark) .lf-forgot { color: #4f46e5; }
        :root:not(.dark) .lf-forgot:hover { color: #4338ca; }
        :root:not(.dark) .lf-error-banner { background: rgba(239, 68, 68, 0.08); color: #dc2626; border-color: rgba(239, 68, 68, 0.2); }
        :root:not(.dark) .lf-field-error { color: #dc2626; }
      `}</style>
    </>
  );
};

export default LoginForm;