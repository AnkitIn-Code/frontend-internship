import React, { useState } from 'react';
import { authAPI } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ✅ Field validation
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    switch (name) {
      case 'fullName':
        if (!value?.trim()) newErrors.fullName = 'Full name is required';
        else if (value.trim().length < 2) newErrors.fullName = 'Name must be at least 2 characters';
        else delete newErrors.fullName;
        break;
      case 'email':
        if (!value) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) newErrors.email = 'Please enter a valid email address';
        else delete newErrors.email;
        break;
      case 'password':
        if (!value) newErrors.password = 'Password is required';
        else if (value.length < 8) newErrors.password = 'Password must be at least 8 characters';
        else delete newErrors.password;
        calculatePasswordStrength(value);
        break;
      case 'confirmPassword':
        if (!value) newErrors.confirmPassword = 'Please confirm your password';
        else if (value !== formData.password) newErrors.confirmPassword = 'Passwords do not match';
        else delete newErrors.confirmPassword;
        break;
      case 'agreeToTerms':
        if (!value) newErrors.agreeToTerms = 'You must agree to the terms';
        else delete newErrors.agreeToTerms;
        break;
      default:
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Password strength logic
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    setPasswordStrength(Math.min(strength, 100));
  };

  // ✅ Input change handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: fieldValue }));
    validateField(name, fieldValue);
  };

  // ✅ Password strength helpers
  const getStrengthColor = () => {
    if (passwordStrength < 25) return '#ef4444';
    if (passwordStrength < 50) return '#f97316';
    if (passwordStrength < 75) return '#eab308';
    return '#22c55e';
  };
  const getStrengthText = () => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

  const isFormValid = () =>
    formData.fullName.trim() &&
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    formData.agreeToTerms &&
    Object.keys(errors).length === 0;

  // ✅ Submit handler (with backend call)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = Object.keys(formData).every((key) => validateField(key, formData[key]));
    if (!isValid) return;
    setIsLoading(true);
    try {
      const data = await authAPI.register({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
      });
      if (!data.token) throw new Error(data.message || 'Registration failed');
      localStorage.setItem('authToken', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userName', data.user.name);
      }
      navigate('/candidate-onboarding', { replace: true });
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="rf-form">
        {/* Full Name */}
        <div className="rf-field">
          <label className="rf-label" htmlFor="rf-fullName">Full Name</label>
          <div className={`rf-input-wrap ${errors.fullName ? 'rf-input-error' : formData.fullName && !errors.fullName ? 'rf-input-valid' : ''}`}>
            <Icon name="User" size={15} className="rf-icon" />
            <input
              id="rf-fullName"
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              className="rf-input"
            />
            {formData.fullName && !errors.fullName && (
              <Icon name="CheckCircle" size={15} className="rf-valid-icon" />
            )}
          </div>
          {errors.fullName && <p className="rf-error-text">{errors.fullName}</p>}
        </div>

        {/* Email */}
        <div className="rf-field">
          <label className="rf-label" htmlFor="rf-email">Email Address</label>
          <div className={`rf-input-wrap ${errors.email ? 'rf-input-error' : formData.email && !errors.email ? 'rf-input-valid' : ''}`}>
            <Icon name="Mail" size={15} className="rf-icon" />
            <input
              id="rf-email"
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="rf-input"
            />
            {formData.email && !errors.email && (
              <Icon name="CheckCircle" size={15} className="rf-valid-icon" />
            )}
          </div>
          {errors.email && <p className="rf-error-text">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="rf-field">
          <label className="rf-label" htmlFor="rf-password">Password</label>
          <div className={`rf-input-wrap ${errors.password ? 'rf-input-error' : formData.password && !errors.password ? 'rf-input-valid' : ''}`}>
            <Icon name="Lock" size={15} className="rf-icon" />
            <input
              id="rf-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="rf-input"
            />
            <button
              type="button"
              className="rf-toggle-pw"
              onClick={() => setShowPassword(v => !v)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={14} />
            </button>
          </div>
          {errors.password && <p className="rf-error-text">{errors.password}</p>}

          {/* Strength bar */}
          {formData.password && (
            <div className="rf-strength">
              <div className="rf-strength-bar-bg">
                <div
                  className="rf-strength-bar"
                  style={{ width: `${passwordStrength}%`, background: getStrengthColor() }}
                />
              </div>
              <span className="rf-strength-label" style={{ color: getStrengthColor() }}>
                {getStrengthText()}
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="rf-field">
          <label className="rf-label" htmlFor="rf-confirmPassword">Confirm Password</label>
          <div className={`rf-input-wrap ${errors.confirmPassword ? 'rf-input-error' : formData.confirmPassword && !errors.confirmPassword ? 'rf-input-valid' : ''}`}>
            <Icon name="LockKeyhole" size={15} className="rf-icon" />
            <input
              id="rf-confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="rf-input"
            />
            <button
              type="button"
              className="rf-toggle-pw"
              onClick={() => setShowConfirm(v => !v)}
              tabIndex={-1}
              aria-label={showConfirm ? 'Hide' : 'Show'}
            >
              <Icon name={showConfirm ? 'EyeOff' : 'Eye'} size={14} />
            </button>
          </div>
          {errors.confirmPassword && <p className="rf-error-text">{errors.confirmPassword}</p>}
        </div>

        {/* Terms */}
        <div className="rf-terms">
          <label className="rf-check-label">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              required
              className="rf-checkbox"
            />
            <span>
              I agree to the{' '}
              <button type="button" className="rf-link">Terms of Service</button>
              {' '}and{' '}
              <button type="button" className="rf-link">Privacy Policy</button>
            </span>
          </label>
          {errors.agreeToTerms && <p className="rf-error-text">{errors.agreeToTerms}</p>}
        </div>

        {/* Submit error */}
        {errors.submit && (
          <div className="rf-error-banner">
            <Icon name="AlertCircle" size={15} />
            <span>{errors.submit}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!isFormValid() || isLoading}
          className="rf-submit"
          id="register-submit-btn"
        >
          {isLoading ? (
            <>
              <span className="rf-spinner" />
              Creating Account...
            </>
          ) : (
            <>
              <Icon name="UserPlus" size={17} />
              Create Account
            </>
          )}
        </button>
      </form>

      <style>{`
        .rf-form { display: flex; flex-direction: column; gap: 1rem; }

        .rf-field { display: flex; flex-direction: column; gap: 5px; }
        .rf-label {
          font-size: 0.8rem; font-weight: 600;
          color: #cbd5e1; letter-spacing: 0.01em;
        }

        .rf-input-wrap {
          display: flex; align-items: center;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 10px;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
          overflow: hidden;
        }
        .rf-input-wrap:focus-within {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }
        .rf-input-wrap.rf-input-error { border-color: #ef4444; }
        .rf-input-wrap.rf-input-error:focus-within { box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15); }
        .rf-input-wrap.rf-input-valid { border-color: #10b981; }
        .rf-input-wrap.rf-input-valid:focus-within { box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12); }

        .rf-icon {
          flex-shrink: 0; margin-left: 12px;
          color: #64748b !important;
        }
        .rf-valid-icon {
          flex-shrink: 0; margin-right: 12px;
          color: #10b981 !important;
        }
        .rf-input {
          flex: 1; padding: 10px 12px;
          background: transparent; border: none; outline: none;
          color: #f8fafc; font-size: 0.875rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .rf-input::placeholder { color: #64748b; }

        .rf-toggle-pw {
          flex-shrink: 0; padding: 0 12px; height: 100%;
          background: transparent; border: none; cursor: pointer;
          color: #64748b;
          transition: color 0.18s; display: flex; align-items: center;
        }
        .rf-toggle-pw:hover { color: #cbd5e1; }

        .rf-error-text { font-size: 0.78rem; color: #f87171; margin: 0; }

        /* Strength */
        .rf-strength { display: flex; align-items: center; gap: 8px; }
        .rf-strength-bar-bg {
          flex: 1; height: 4px; border-radius: 4px;
          background: #334155;
          overflow: hidden;
        }
        .rf-strength-bar {
          height: 100%; border-radius: 4px;
          transition: width 0.3s ease, background 0.3s;
        }
        .rf-strength-label { font-size: 0.75rem; font-weight: 600; min-width: 38px; text-align: right; }

        /* Terms */
        .rf-terms { display: flex; flex-direction: column; gap: 5px; }
        .rf-check-label {
          display: flex; align-items: flex-start; gap: 8px;
          font-size: 0.81rem; color: #94a3b8;
          cursor: pointer; user-select: none; line-height: 1.5;
        }
        .rf-checkbox {
          width: 15px; height: 15px; flex-shrink: 0; margin-top: 2px;
          accent-color: #4f46e5; cursor: pointer;
        }
        .rf-link {
          color: #818cf8; background: none; border: none;
          cursor: pointer; padding: 0; font-weight: 600;
          font-size: inherit; transition: color 0.18s;
        }
        .rf-link:hover { color: #a78bfa; text-decoration: underline; }

        /* Error banner */
        .rf-error-banner {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px; border-radius: 10px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #f87171; font-size: 0.82rem;
        }

        /* Submit */
        .rf-submit {
          margin-top: 0.25rem;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 10px 16px; border-radius: 10px;
          font-size: 0.92rem; font-weight: 600; color: #ffffff;
          background: #4f46e5;
          border: none; cursor: pointer;
          box-shadow: 0 1px 3px rgba(79, 70, 229, 0.25);
          transition: all 0.18s ease;
        }
        .rf-submit:hover:not(:disabled) {
          background: #4338ca;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
        }
        .rf-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .rf-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: rfSpin 0.7s linear infinite;
        }
        @keyframes rfSpin { to { transform: rotate(360deg); } }

        /* ═══ LIGHT MODE OVERRIDES ═══ */
        :root:not(.dark) .rf-label { color: #334155; }
        :root:not(.dark) .rf-input-wrap {
          background: #ffffff;
          border-color: #cbd5e1;
        }
        :root:not(.dark) .rf-input-wrap:focus-within {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
        }
        :root:not(.dark) .rf-input { color: #0f172a; }
        :root:not(.dark) .rf-input::placeholder { color: #94a3b8; }
        :root:not(.dark) .rf-icon { color: #94a3b8 !important; }
        :root:not(.dark) .rf-valid-icon { color: #10b981 !important; }
        :root:not(.dark) .rf-toggle-pw { color: #94a3b8; }
        :root:not(.dark) .rf-toggle-pw:hover { color: #0f172a; }
        :root:not(.dark) .rf-strength-bar-bg { background: #e2e8f0; }
        :root:not(.dark) .rf-check-label { color: #64748b; }
        :root:not(.dark) .rf-link { color: #4f46e5; }
        :root:not(.dark) .rf-link:hover { color: #4338ca; }
        :root:not(.dark) .rf-error-banner { background: rgba(239, 68, 68, 0.08); color: #dc2626; border-color: rgba(239, 68, 68, 0.2); }
        :root:not(.dark) .rf-error-text { color: #dc2626; }
      `}</style>
    </>
  );
};

export default RegistrationForm;