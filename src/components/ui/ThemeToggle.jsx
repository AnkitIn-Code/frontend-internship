import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * A reusable light/dark theme toggle button that can be placed in any page.
 * Matches the main dashboard's subtle, professional slate/indigo styling.
 */
const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`theme-toggle-btn ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        /* Sun icon */
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
        </svg>
      ) : (
        /* Moon icon */
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
      <style>{`
        .theme-toggle-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid #334155;
          background: #1e293b;
          color: #cbd5e1;
          cursor: pointer;
          transition: all 0.18s ease;
          flex-shrink: 0;
        }
        .theme-toggle-btn:hover {
          background: #334155;
          color: #ffffff;
          border-color: #475569;
          transform: translateY(-1px);
        }
        /* Light mode */
        :root:not(.dark) .theme-toggle-btn {
          border-color: #e2e8f0;
          background: #f1f5f9;
          color: #475569;
        }
        :root:not(.dark) .theme-toggle-btn:hover {
          background: #e2e8f0;
          border-color: #cbd5e1;
          color: #0f172a;
          transform: translateY(-1px);
        }
      `}</style>
    </button>
  );
};

export default ThemeToggle;
