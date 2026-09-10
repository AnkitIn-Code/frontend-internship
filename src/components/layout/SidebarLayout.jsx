import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Icon from '../AppIcon';

import { useLocation } from 'react-router-dom';

const PUBLIC_NO_SIDEBAR = ['/', '/user-login', '/user-registration', '/candidate-onboarding'];

/**
 * SidebarLayout — wraps all authenticated pages.
 * On desktop: sticky sidebar (240px) + scrollable main content area.
 * On mobile:  top bar with hamburger → opens a drawer sidebar.
 */
const SidebarLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const token = localStorage.getItem('authToken');

  // Never show sidebar if unauthenticated or on public auth pages
  const isPublic = PUBLIC_NO_SIDEBAR.includes(location.pathname);
  if (!token || isPublic) {
    return <main className="flex-1 min-w-0">{children}</main>;
  }

  const isFixedLayout = location.pathname.startsWith('/resume-tools') || location.pathname.startsWith('/resume-builder');

  return (
    <div className={`flex min-h-screen bg-background ${isFixedLayout ? 'lg:h-screen lg:overflow-hidden' : ''}`}>
      {/* ── Sidebar (desktop: always visible | mobile: drawer) ── */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── Right side: top mobile bar + main content (padded left by w-60 on desktop) ── */}
      <div className={`flex-1 flex flex-col min-w-0 lg:pl-60 min-h-screen ${isFixedLayout ? 'lg:h-screen lg:max-h-screen lg:overflow-hidden' : ''}`}>

        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
            aria-label="Open menu"
          >
            <Icon name="Menu" size={16} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Icon name="Layers" size={13} className="text-white" />
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white">InterGuide</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              v2.0
            </span>
          </div>
          {/* Spacer to balance */}
          <div className="w-8" aria-hidden="true" />
        </div>

        {/* Page content */}
        <main className={`flex-1 ${isFixedLayout ? 'lg:h-full lg:min-h-0 lg:overflow-hidden flex flex-col' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
