import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      try {
        localStorage.setItem('theme', 'dark');
      } catch {}
    } else {
      root.classList.remove('dark');
      try {
        localStorage.setItem('theme', 'light');
      } catch {}
    }
  }, [isDark]);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'theme' && e.newValue) {
        setIsDark(e.newValue === 'dark');
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const toggleTheme = () => setIsDark(prev => !prev);
  const setTheme = (mode) => setIsDark(mode === 'dark');

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
