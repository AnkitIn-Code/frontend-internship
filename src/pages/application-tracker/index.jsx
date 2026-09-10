import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import HelpDeskWidget from '../../components/ui/HelpDeskWidget';
import CalendarView from './components/CalendarView';
import { applicationsAPI } from '../../services/api';
import {
  Bookmark, Star, Briefcase, Calendar, ExternalLink,
  Trash2, Clock, Plus, Search, Loader2, RefreshCw, X, Check,
  CalendarDays, AlertCircle, Compass, Sparkles
} from 'lucide-react';

/* ─── Constants ────────────────────────────────────────────── */
const STATUS_WANT = 'want_to_apply';
const STATUS_WISH = 'wishlist';

/* ─── Utility helpers ──────────────────────────────────────── */
const formatDate = (d) => {
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return '';
    const diff = Math.floor((Date.now() - dt) / 864e5);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 0) {
      const daysLeft = -diff;
      if (daysLeft === 1) return 'Tomorrow';
      if (daysLeft <= 7) return `in ${daysLeft}d`;
      return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }
    if (diff < 7) return `${diff}d ago`;
    return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch { return ''; }
};

const formatDateInput = (d) => {
  if (!d) return '';
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return '';
    return dt.toISOString().split('T')[0]; // YYYY-MM-DD for input[type=date]
  } catch { return ''; }
};

/* ─── Deadline modal ───────────────────────────────────────── */
const DeadlineModal = ({ app, onSave, onClose }) => {
  const [deadline, setDeadline]         = useState(formatDateInput(app.deadline));
  const [interviewDate, setInterview]   = useState(formatDateInput(app.interviewDate));
  const [followUpDate, setFollowUp]     = useState(formatDateInput(app.followUpDate));
  const [notes, setNotes]               = useState(app.notes || '');
  const [saving, setSaving]             = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(app._id || app.id, {
        deadline:      deadline      || null,
        interviewDate: interviewDate || null,
        followUpDate:  followUpDate  || null,
        notes,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.18 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-slate-900 dark:text-slate-100"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Set Dates & Reminders</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[220px]">{app.title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Deadline */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              Application Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>

          {/* Interview date */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />
              Interview Date
            </label>
            <input
              type="date"
              value={interviewDate}
              onChange={e => setInterview(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>

          {/* Follow-up */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              Follow-up Date
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={e => setFollowUp(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Any notes about this application..."
              className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all resize-none"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-500/20 transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* ─── Event detail modal (from calendar click) ─────────────── */
const EventModal = ({ event, onClose }) => {
  if (!event) return null;
  const dt = new Date(event.dateStr);
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-slate-900 dark:text-slate-100"
      >
        <div className="flex items-center justify-between mb-4">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${event.bgLight} ${event.textColor}`}>
            {event.subtitle}
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">{event.app?.title || 'Internship'}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{event.app?.company || ''}</p>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <CalendarDays className="w-4 h-4 text-indigo-500 shrink-0" />
          {dt.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        {event.app?.url && (
          <a
            href={event.app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-500/20 transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> Apply Now
          </a>
        )}
      </motion.div>
    </div>
  );
};

/* ─── Internship Card ──────────────────────────────────────── */
const AppCard = ({ app, onRemove, onSetDates, type }) => {
  const company = app.company || '';
  const logo    = app.companyLogo || app.logo;
  const skills  = Array.isArray(app.requiredSkills) ? app.requiredSkills : [];
  const isWant  = type === STATUS_WANT;
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    await onRemove(app._id || app.id);
  };

  const hasDeadline = !!app.deadline || !!app.interviewDate;
  const deadlinePast = app.deadline && new Date(app.deadline) < new Date();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`bg-white dark:bg-slate-900 rounded-2xl border p-4 shadow-xs hover:shadow-md dark:hover:shadow-slate-950/60 transition-all duration-200 group relative ${
        isWant
          ? 'border-indigo-100/90 dark:border-indigo-900/40 hover:border-indigo-300 dark:hover:border-indigo-700/60'
          : 'border-amber-100/90 dark:border-amber-900/40 hover:border-amber-300 dark:hover:border-amber-700/60'
      }`}
    >
      {/* Remove button — always visible */}
      <button
        onClick={handleRemove}
        disabled={removing}
        className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-rose-50/80 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center justify-center transition-all border border-rose-100/80 dark:border-rose-900/40 disabled:opacity-40"
        title="Remove from tracker"
      >
        {removing
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <Trash2 className="w-3.5 h-3.5" />
        }
      </button>

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-850 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
          {logo && !logo.includes('backend.talentd.in')
            ? <img src={logo} alt={company} className="w-6 h-6 object-contain" onError={e => { e.target.style.display = 'none'; }} />
            : <span className={`font-black text-sm ${isWant ? 'text-indigo-600 dark:text-indigo-400' : 'text-amber-600 dark:text-amber-400'}`}>{(company || '?').charAt(0).toUpperCase()}</span>
          }
        </div>
        <div className="flex-1 min-w-0 pr-6">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight line-clamp-2 mb-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{app.title}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
            {company}
            {app.location && <span className="text-slate-400 dark:text-slate-500"> · {app.location}</span>}
          </p>
        </div>
      </div>

      {/* Meta chips */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mb-2.5">
        {app.domain && (
          <span className="flex items-center gap-1"><Briefcase className="w-3 h-3 text-slate-400 dark:text-slate-500" />{app.domain}</span>
        )}
        {typeof app.stipend === 'number' && app.stipend > 0 && (
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">₹{app.stipend.toLocaleString()}/mo</span>
        )}
        {app.source && (
          <span className="px-1.5 py-0.5 bg-slate-100/80 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-full text-[10px] text-slate-600 dark:text-slate-400 font-medium">{app.source}</span>
        )}
      </div>

      {/* Deadline badge */}
      {app.deadline && (
        <div className={`flex items-center gap-1.5 mb-2 px-2.5 py-1.5 rounded-xl text-[11px] font-bold ${
          deadlinePast
            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-200/70 dark:border-rose-900/50'
            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-900/50'
        }`}>
          {deadlinePast ? <AlertCircle className="w-3.5 h-3.5 shrink-0" /> : <Clock className="w-3.5 h-3.5 shrink-0" />}
          Deadline: {formatDate(app.deadline)}
          {deadlinePast && ' (Expired)'}
        </div>
      )}

      {/* Interview date badge */}
      {app.interviewDate && (
        <div className="flex items-center gap-1.5 mb-2 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200/70 dark:border-violet-900/50">
          <CalendarDays className="w-3.5 h-3.5 shrink-0" />
          Interview: {formatDate(app.interviewDate)}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {skills.slice(0, 3).map((s, i) => (
            <span key={i} className="px-2 py-0.5 bg-slate-100/80 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 text-[10px] font-medium rounded-md">{s}</span>
          ))}
          {skills.length > 3 && (
            <span className="px-2 py-0.5 bg-slate-100/80 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 text-[10px] rounded-md font-semibold">+{skills.length - 3}</span>
          )}
        </div>
      )}

      {/* Notes */}
      {app.notes && (
        <p className="text-[11px] text-slate-600 dark:text-slate-300 italic mb-2.5 line-clamp-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 rounded-xl px-2.5 py-1.5">
          {app.notes}
        </p>
      )}

      {/* Action row */}
      <div className="flex gap-2 mt-2">
        {app.url && (
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold transition-all shadow-2xs ${
              isWant
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-900/50'
                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200/80 dark:border-amber-900/50'
            }`}
            onClick={e => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3" /> Apply
          </a>
        )}
        <button
          onClick={() => onSetDates(app)}
          className={`${app.url ? '' : 'flex-1'} flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold bg-slate-50 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700/70 text-slate-700 dark:text-slate-200 transition-all shadow-2xs`}
          title="Set deadline / interview date"
        >
          <CalendarDays className="w-3 h-3 text-indigo-500" />
          {hasDeadline ? 'Dates' : 'Set Date'}
        </button>
      </div>

      {/* Added date */}
      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 text-center">
        Added {formatDate(app.createdAt || app.appliedAt || Date.now())}
      </p>
    </motion.div>
  );
};

/* ─── Section column ───────────────────────────────────────── */
const SectionCol = ({ title, icon: Icon, iconBg, iconColor, borderColor, count, loading, children, emptyMsg, emptyIcon: EIcon, onExplore }) => (
  <div className={`bg-white dark:bg-slate-900/90 rounded-2xl border ${borderColor} dark:border-slate-800 shadow-xs flex flex-col overflow-hidden backdrop-blur-sm transition-colors`}>
    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shadow-2xs`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{loading ? '…' : `${count} item${count !== 1 ? 's' : ''}`}</p>
        </div>
      </div>
      <span className={`text-sm font-black px-2.5 py-1 rounded-full ${iconBg} ${iconColor}`}>{count}</span>
    </div>

    <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[320px] max-h-[540px] scrollbar-hide">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <>
          {children}
          {count === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              {EIcon && (
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mb-3">
                  <EIcon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                </div>
              )}
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">{emptyMsg}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mb-3">Browse all open opportunities and bookmark the ones you love.</p>
              <button
                onClick={onExplore}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/50 transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <Compass className="w-3.5 h-3.5" /> Explore All Jobs
              </button>
            </div>
          )}
        </>
      )}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════ */
/*  MAIN PAGE COMPONENT                                       */
/* ═══════════════════════════════════════════════════════════ */
const ApplicationTracker = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [searchQuery, setSearchQuery]   = useState('');
  const [deadlineModal, setDeadlineModal] = useState(null);   // app object | null
  const [calEventModal, setCalEventModal] = useState(null);   // calendar event | null
  const [refreshing, setRefreshing]     = useState(false);

  useEffect(() => {
    document.title = 'Application Tracker – InterGuide';
  }, []);

  /* ── Fetch from DB ── */
  const loadApplications = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const res = await applicationsAPI.list();
      const apps = Array.isArray(res) ? res : (res?.applications || []);
      setApplications(apps);
    } catch (e) {
      console.error('Failed to load applications', e);
      setError('Failed to load your tracker. Please try refreshing.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadApplications(); }, [loadApplications]);

  /* ── Remove ── */
  const handleRemove = useCallback(async (id) => {
    setApplications(prev => prev.filter(a => (a._id || a.id) !== id));
    try {
      await applicationsAPI.delete(id);
    } catch (e) {
      console.error('Delete failed', e);
      loadApplications(true); // revert
    }
  }, [loadApplications]);

  /* ── Save dates ── */
  const handleSaveDates = useCallback(async (id, updates) => {
    const res = await applicationsAPI.update(id, updates);
    setApplications(prev => prev.map(a => (a._id || a.id) === id ? { ...a, ...updates, ...res } : a));
  }, []);

  /* ── Filter ── */
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return applications;
    const q = searchQuery.toLowerCase();
    return applications.filter(a =>
      (a.title || '').toLowerCase().includes(q) ||
      (a.company || '').toLowerCase().includes(q)
    );
  }, [applications, searchQuery]);

  const wantList = filtered.filter(a => a.status === STATUS_WANT);
  const wishList = filtered.filter(a => a.status === STATUS_WISH);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/50">
                Career Management
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Application Tracker</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track your target roles, save wishlists, and organize your interview deadlines</p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 shadow-xs focus-within:border-indigo-500 dark:focus-within:border-indigo-500 transition-all">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Filter saved roles…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent w-32 sm:w-44 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Refresh */}
            <button
              onClick={() => loadApplications(true)}
              disabled={refreshing}
              className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors disabled:opacity-50 shadow-xs"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Discover Jobs button */}
            <button
              onClick={() => navigate('/jobs')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-bold shadow-sm shadow-indigo-500/20 hover:shadow-md hover:shadow-indigo-500/30 transition-all active:scale-[0.98]"
            >
              <Compass className="w-4 h-4" /> Discover Jobs
            </button>
          </div>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 rounded-2xl px-4 py-3 text-sm font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
            <button onClick={() => loadApplications()} className="ml-auto underline text-xs">Retry</button>
          </div>
        )}

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: 'Want to Apply',
              count: wantList.length,
              chip: 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/70 dark:border-indigo-900/50',
              icon: Star,
              iconColor: 'text-indigo-500',
            },
            {
              label: 'Wishlist',
              count: wishList.length,
              chip: 'bg-amber-50/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-amber-900/50',
              icon: Bookmark,
              iconColor: 'text-amber-500',
            },
            {
              label: 'Total Saved',
              count: wantList.length + wishList.length,
              chip: 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/60',
              icon: Briefcase,
              iconColor: 'text-slate-500 dark:text-slate-400',
            },
            {
              label: 'Deadlines Set',
              count: [...wantList, ...wishList].filter(a => a.deadline || a.interviewDate).length,
              chip: 'bg-rose-50/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/70 dark:border-rose-900/50',
              icon: Clock,
              iconColor: 'text-rose-500',
            },
          ].map(({ label, count, chip, icon: Icon, iconColor }) => (
            <div
              key={label}
              className={`flex items-center justify-between p-3 sm:px-4 sm:py-3 rounded-2xl border ${chip} transition-all shadow-2xs`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon className={`w-4 h-4 ${iconColor} shrink-0`} />
                <span className="text-xs font-semibold truncate">{label}</span>
              </div>
              <span className="text-sm sm:text-base font-black ml-2">{count}</span>
            </div>
          ))}
        </div>

        {/* ── Main layout: cards left, calendar right ── */}
        <div className="flex flex-col xl:flex-row gap-6 mb-8">

          {/* Left: Want to Apply + Wishlist */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5 min-w-0">
            <SectionCol
              title="Want to Apply"
              icon={Star}
              iconBg="bg-indigo-50 dark:bg-indigo-950/60"
              iconColor="text-indigo-600 dark:text-indigo-400"
              borderColor="border-indigo-100/80"
              count={wantList.length}
              loading={loading}
              emptyMsg="No applications marked yet"
              emptyIcon={Star}
              onExplore={() => navigate('/jobs')}
            >
              <AnimatePresence>
                {wantList.map(app => (
                  <AppCard
                    key={app._id || app.id}
                    app={app}
                    onRemove={handleRemove}
                    onSetDates={setDeadlineModal}
                    type={STATUS_WANT}
                  />
                ))}
              </AnimatePresence>
            </SectionCol>

            <SectionCol
              title="Wishlist"
              icon={Bookmark}
              iconBg="bg-amber-50 dark:bg-amber-950/60"
              iconColor="text-amber-600 dark:text-amber-400"
              borderColor="border-amber-100/80"
              count={wishList.length}
              loading={loading}
              emptyMsg="Your wishlist is empty"
              emptyIcon={Bookmark}
              onExplore={() => navigate('/jobs')}
            >
              <AnimatePresence>
                {wishList.map(app => (
                  <AppCard
                    key={app._id || app.id}
                    app={app}
                    onRemove={handleRemove}
                    onSetDates={setDeadlineModal}
                    type={STATUS_WISH}
                  />
                ))}
              </AnimatePresence>
            </SectionCol>
          </div>

          {/* Right: Calendar */}
          <div className="w-full xl:w-[410px] shrink-0">
            <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 xl:sticky xl:top-6 backdrop-blur-sm transition-colors">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center shadow-2xs">
                  <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Deadlines Calendar</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">View upcoming interviews & submission dates</p>
                </div>
              </div>

              <CalendarView
                applications={applications}
                onEventClick={setCalEventModal}
              />
            </div>
          </div>
        </div>

      </main>

      {/* ── Modals ── */}
      <AnimatePresence>
        {deadlineModal && (
          <DeadlineModal
            key="deadline-modal"
            app={deadlineModal}
            onSave={handleSaveDates}
            onClose={() => setDeadlineModal(null)}
          />
        )}
        {calEventModal && (
          <EventModal
            key="cal-event-modal"
            event={calEventModal}
            onClose={() => setCalEventModal(null)}
          />
        )}
      </AnimatePresence>

      <HelpDeskWidget />
    </div>
  );
};

export default ApplicationTracker;