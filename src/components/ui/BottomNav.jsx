import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import { useTranslation } from 'react-i18next';

const tabs = [
  { key: 'dashboard',  path: '/main-dashboard',         icon: 'LayoutDashboard', label: 'Home' },
  { key: 'jobs',       path: '/jobs',                   icon: 'Compass',         label: 'Jobs' },
  { key: 'interview',  path: '/ai-interview',           icon: 'Cpu',             label: 'Interview' },
  { key: 'track',      path: '/application-tracker',   icon: 'ClipboardList',   labelKey: 'nav.track' },
  { key: 'profile',    path: '/user-profile-management', icon: 'User',          labelKey: 'nav.profile' },
];


const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path) => {
    if (path === '/jobs') return location?.pathname?.startsWith('/jobs');
    return location?.pathname === path;
  };


  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 shadow-lg">
      <div className="grid grid-cols-5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center justify-center py-2.5 text-xs transition-colors ${
              isActive(tab.path)
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <Icon name={tab.icon} size={18} />
            <span className="mt-1 text-[10px]">{tab.label || t(tab.labelKey)}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
