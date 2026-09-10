import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import { useTheme } from '../../context/ThemeContext';
import { calcProfileCompletion } from '../../utils/profileCompletion';
import { fetchTalentdCounts } from '../../services/talentdAPI';

// ─── FleetCode-Style Nav Sections Config ──────────────────────────────────────
const NAV_SECTIONS = [
  {
    label: 'MAIN',
    items: [
      { label: 'Dashboard',   path: '/main-dashboard',         icon: 'LayoutDashboard' },
    ],
  },
  {
    label: 'JOBS & TRACKING',
    items: [
      { label: 'All Jobs',    path: '/jobs',                   icon: 'Compass',       badge: '4,264' },
      { label: 'Internships', path: '/jobs/internships',       icon: 'GraduationCap', badge: '1,468' },
      { label: 'Freshers',    path: '/jobs/freshers',          icon: 'Briefcase',     badge: '2,789' },
      { label: 'Tracker',      path: '/application-tracker',   icon: 'ClipboardList', badge: 'Active' },
    ],
  },
  {
    label: 'TOOLS',
    items: [
      { label: 'Resume Builder', path: '/resume-tools',        icon: 'FileText',      badge: 'ATS 95' },
      { label: 'ATS Analyzer',   path: '/ats-analyzer',        icon: 'BarChart2' },
      { label: 'AI Interview',   path: '/ai-interview',        icon: 'Cpu',           badge: 'Live AI' },
    ],
  },
  {
    label: 'ACCOUNT',
    items: [
      { label: 'Profile',      path: '/user-profile-management', icon: 'User' },
      { label: 'Account',      path: '/settings',                icon: 'Settings' },
    ],
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location   = useLocation();
  const navigate   = useNavigate();
  const sidebarRef = useRef(null);
  const { isDark, setTheme } = useTheme();

  // Dynamic live job counts
  const [counts, setCounts] = useState({ all: 4264, internships: 1468, freshers: 2789 });

  useEffect(() => {
    fetchTalentdCounts().then(res => {
      if (res && res.all) setCounts(res);
    }).catch(() => {});
  }, []);

  const getBadge = (item) => {
    if (item.path === '/jobs') return counts.all ? counts.all.toLocaleString() : '4,264';
    if (item.path === '/jobs/internships') return counts.internships ? counts.internships.toLocaleString() : '1,468';
    if (item.path === '/jobs/freshers') return counts.freshers ? counts.freshers.toLocaleString() : '2,789';
    return item.badge;
  };

  // Close on outside click (mobile drawer)
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  const isActive = (path) => {
    if (path === '/jobs') return location.pathname === '/jobs';
    if (path === '/jobs/internships') return location.pathname === '/jobs/internships';
    if (path === '/jobs/freshers') return location.pathname === '/jobs/freshers';
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path + '/'));
  };

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
    localStorage.removeItem('userSkills');
    localStorage.removeItem('userEmail');
    sessionStorage.clear();
    navigate('/user-login');
    onClose();
  };

  // Load user data from localStorage for profile chip & readiness
  const [userName, setUserName] = useState('Candidate');
  const [profileProgress, setProfileProgress] = useState(0);

  useEffect(() => {
    const updateStats = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('user') || localStorage.getItem('userData') || '{}');
        if (stored?.name) setUserName(stored.name);
        const score = typeof stored?.profile?.completion === 'number'
          ? stored.profile.completion
          : calcProfileCompletion(stored?.profile || {}, stored);
        setProfileProgress(score);
      } catch (_) {}
    };

    updateStats();
    window.addEventListener('storage', updateStats);
    return () => window.removeEventListener('storage', updateStats);
  }, [location.pathname]);

  const userInitial = (userName.charAt(0) || 'C').toUpperCase();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar panel (fixed desktop w-60, drawer on mobile) ── */}
      <aside
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 h-screen z-40 flex flex-col
          w-60 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800
          transition-transform duration-300 ease-in-out select-none
          ${isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'}
          lg:translate-x-0 lg:shadow-none
        `}
        aria-label="Sidebar navigation"
      >
        {/* ── 1. Header: Logo + v2.0 Badge + Collapse button ── */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          <button
            onClick={() => handleNav('/main-dashboard')}
            className="flex items-center gap-2.5 group text-left"
            aria-label="Go to Dashboard"
          >
            {/* Logo Mark: Indigo layered icon matching FleetCode */}
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform duration-200 shrink-0">
              <Icon name="Layers" size={17} className="text-white" />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[15px] text-slate-900 dark:text-white tracking-tight">
                InterGuide
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50">
                v2.0
              </span>
            </div>
          </button>

          {/* Close button on mobile / collapse icon */}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close sidebar"
          >
            <Icon name="ChevronLeft" size={14} />
          </button>
        </div>

        {/* ── 2. Navigation Sections ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4" aria-label="Main navigation">
          {NAV_SECTIONS.map((section, sIndex) => (
            <div key={section.label || sIndex} className="space-y-1">
              {section.label && (
                <div className="px-2.5 pb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {section.label}
                  </span>
                </div>
              )}

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNav(item.path)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 rounded-xl
                        text-[13px] font-medium transition-all duration-150 cursor-pointer
                        ${active
                          ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                        }
                      `}
                      aria-current={active ? 'page' : undefined}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          name={item.icon}
                          size={16}
                          className={`shrink-0 ${active ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {getBadge(item) && (
                        <span
                          className={`
                            text-[11px] font-semibold px-2 py-0.5 rounded-md shrink-0
                            ${active
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50'
                            }
                          `}
                        >
                          {getBadge(item)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── 3. Bottom Area: Progress + Light/Dark Toggle + User Profile Chip ── */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-3 shrink-0 bg-white dark:bg-slate-900">
          {/* Readiness / Progress bar (FleetCode style) - hidden when 100% complete */}
          {profileProgress < 100 && (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  PROFILE PROGRESS
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">
                  {profileProgress}%
                </span>
              </div>

              {/* Thin Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-200/70 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-700"
                  style={{ width: `${profileProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                <span>{Math.round((profileProgress / 100) * 5)} / 5 steps</span>
              </div>
            </div>
          )}

          {/* Light / Dark Mode segmented switch (FleetCode style) */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/50">
            <button
              onClick={() => setTheme('light')}
              className={`
                flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer
                ${!isDark
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }
              `}
              aria-label="Switch to light mode"
            >
              <Icon name="Sun" size={13} />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`
                flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer
                ${isDark
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }
              `}
              aria-label="Switch to dark mode"
            >
              <Icon name="Moon" size={13} />
              <span>Dark</span>
            </button>
          </div>

          {/* User Profile Chip with Online indicator (FleetCode style) */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
            <button
              onClick={() => handleNav('/user-profile-management')}
              className="flex items-center gap-2.5 min-w-0 text-left group"
              aria-label="View Profile"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {userInitial}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">
                  {userName}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    Online
                  </span>
                </div>
              </div>
            </button>

            {/* Logout icon */}
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <Icon name="LogOut" size={14} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
