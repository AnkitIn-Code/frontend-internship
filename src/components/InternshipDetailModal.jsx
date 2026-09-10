import React, { useEffect, useState } from 'react';
import Icon from './AppIcon';
import { applicationsAPI } from '../services/api';

/**
 * InternshipDetailModal
 *
 * Props:
 *   internship  – the internship object
 *   onClose     – called when user dismisses
 */
const InternshipDetailModal = ({ internship, onClose }) => {
  const [saving, setSaving] = useState(null); // 'want_to_apply' | 'wishlist' | null
  const [saved, setSaved] = useState(null);   // 'want_to_apply' | 'wishlist' | null — tracks current save state
  const [toast, setToast] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!internship) return null;

  const company = internship.company?.name || internship.company || '';
  const logo    = internship.company?.logo || internship.companyLogo;
  const skills  = Array.isArray(internship.requiredSkills) ? internship.requiredSkills : [];

  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return ''; }
  };

  const handleApply = () => {
    if (internship.url) window.open(internship.url, '_blank', 'noopener');
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleSave = async (status) => {
    if (saving) return;
    // Toggle off if already saved in that status
    if (saved === status) {
      setSaved(null);
      showToast('Removed from tracker');
      return;
    }
    setSaving(status);
    try {
      // Normalise company — it can be a string or { name, logo } object
      const companyName = typeof internship.company === 'object' && internship.company !== null
        ? internship.company.name
        : internship.company;
      const companyLogo = internship.companyLogo
        || (typeof internship.company === 'object' ? internship.company?.logo : undefined);

      await applicationsAPI.upsert({
        internshipId: internship._id || internship.id,
        status,
        title:          internship.title,
        company:        companyName,
        companyLogo:    companyLogo,
        location:       internship.location,
        domain:         internship.domain,
        stipend:        typeof internship.stipend === 'number' ? internship.stipend : undefined,
        duration:       internship.duration,
        url:            internship.url,
        requiredSkills: Array.isArray(internship.requiredSkills) ? internship.requiredSkills : [],
        description:    internship.description,
        postedAt:       internship.postedAt,
        source:         internship.source,
        isRemote:       internship.isRemote,
      });
      setSaved(status);
      showToast(
        status === 'want_to_apply'
          ? '⭐ Added to Want to Apply!'
          : '🔖 Added to Wishlist!'
      );
    } catch (err) {
      console.error('Save failed:', err);
      showToast('Failed to save. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  const sourceColors = {
    LinkedIn:    'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
    Internshala: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
    Naukri:      'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300',
    Arbeitnow:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    Remotive:    'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300',
    Findwork:    'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
    default:     'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300',
  };
  const srcColor = sourceColors[internship.source] || sourceColors.default;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl animate-fade-in">
          {toast}
        </div>
      )}

      {/* Modal Panel */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors backdrop-blur-sm"
        >
          <Icon name="X" size={18} />
        </button>

        {/* Header gradient */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 px-6 pt-8 pb-10 rounded-t-3xl">
          <div className="flex items-start gap-4">
            {/* Company logo */}
            <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 overflow-hidden shadow-lg backdrop-blur-sm">
              {logo && !logo.includes('backend.talentd.in') ? (
                <img src={logo} alt={company} className="w-10 h-10 object-contain"
                  onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                <span className="text-2xl font-black text-white">
                  {(company || '?').charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0 pr-8">
              <h2 className="text-xl font-extrabold text-white leading-tight mb-1">
                {internship.title}
              </h2>
              <p className="text-indigo-100 font-semibold text-sm">{company}</p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {internship.source && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${srcColor}`}>
                    {internship.source}
                  </span>
                )}
                {internship.isRemote && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-400/20 border border-emerald-300/30 text-emerald-100">
                    Remote
                  </span>
                )}
                {internship.domain && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/15 text-white/90">
                    {internship.domain}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">

          {/* ── TRACKER ACTION BUTTONS ── */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSave('want_to_apply')}
              disabled={!!saving}
              className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all border ${
                saved === 'want_to_apply'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20'
                  : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
              } disabled:opacity-60 disabled:cursor-wait`}
            >
              {saving === 'want_to_apply' ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Icon name="Star" size={16} />
              )}
              {saved === 'want_to_apply' ? '✓ Want to Apply' : 'Want to Apply'}
            </button>

            <button
              onClick={() => handleSave('wishlist')}
              disabled={!!saving}
              className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all border ${
                saved === 'wishlist'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-900/50'
              } disabled:opacity-60 disabled:cursor-wait`}
            >
              {saving === 'wishlist' ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Icon name="Bookmark" size={16} />
              )}
              {saved === 'wishlist' ? '✓ Wishlisted' : 'Wishlist'}
            </button>
          </div>

          {/* Quick info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: 'MapPin',   label: 'Location', value: internship.location || 'Not specified' },
              { icon: 'Clock',    label: 'Duration',  value: internship.duration || 'Not specified' },
              { icon: 'DollarSign', label: 'Stipend', value: internship.stipend ? `₹${internship.stipend.toLocaleString()}` : 'Not disclosed' },
              { icon: 'Calendar', label: 'Posted',    value: internship.postedAt ? formatDate(internship.postedAt) : 'Recently' },
            ].map(({ icon, label, value }) => (
              <div key={label} className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-xl p-3 text-center">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-950/60 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Icon name={icon} size={15} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{value}</p>
              </div>
            ))}
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                <Icon name="Code" size={16} className="text-indigo-600 dark:text-indigo-400" />
                Required Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {internship.description && (
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                <Icon name="FileText" size={16} className="text-indigo-600 dark:text-indigo-400" />
                About the Role
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {internship.description.replace(/<[^>]+>/g, '').slice(0, 800)}
                {internship.description.length > 800 && '…'}
              </p>
            </div>
          )}

          {/* AI Reasoning */}
          {internship.aiReasoning && (
            <div className="bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Sparkles" size={16} className="text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Why this matches you</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{internship.aiReasoning}</p>
            </div>
          )}

          {/* Apply Now */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleApply}
              disabled={!internship.url}
              className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Icon name="ExternalLink" size={16} />
              Apply Now
            </button>
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
            >
              Close
            </button>
          </div>

          {/* Note */}
          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
            Clicking "Apply Now" will open the original job posting in a new tab.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InternshipDetailModal;
