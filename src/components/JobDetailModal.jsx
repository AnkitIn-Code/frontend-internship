import React, { useEffect, useState } from 'react';
import {
  X, Building2, MapPin, Briefcase, Clock, Calendar,
  ExternalLink, Check, Star, Bookmark, DollarSign,
  GraduationCap, Globe, Sparkles, Tag, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { formatSalary, timeAgo } from '../services/talentdAPI';
import { applicationsAPI } from '../services/api';

const JobDetailModal = ({ job, onClose }) => {
  const [saving, setSaving] = useState(null); // 'want_to_apply' | 'wishlist' | null
  const [saved, setSaved]   = useState(null);
  const [toast, setToast]   = useState('');

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!job) return null;

  const companyName = job.company?.company_name || job.company?.name || 'Company';
  const companyLogo = job.company?.company_logo || job.companyLogo || job.logo;
  const companyWebsite = job.company?.company_website || job.company_website;
  const companyCategory = job.company?.company_category || job.category;
  const companyAbout = job.company?.company_about;

  const salary    = formatSalary(job.salary_range);
  const posted    = timeAgo(job.date?.published);
  const locations = Array.isArray(job.locations) ? job.locations : [];
  const skills    = Array.isArray(job.skills) ? job.skills : [];
  const tags      = Array.isArray(job.tags) ? job.tags : [];
  const batchYears = Array.isArray(job.batch_years) ? job.batch_years : [];
  const education = Array.isArray(job.education) ? job.education : [];
  const jobTypes  = Array.isArray(job.job_type) ? job.job_type : [];
  const empTypes  = Array.isArray(job.employment_type) ? job.employment_type : [];

  const experienceStr = job.experience
    ? `${job.experience.min ?? 0} – ${job.experience.max ?? 1} Years`
    : null;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleApply = () => {
    if (job.apply_link) window.open(job.apply_link, '_blank', 'noopener');
  };

  const handleSave = async (status) => {
    if (saving) return;
    if (saved === status) {
      setSaved(null);
      showToast('Removed from tracker');
      return;
    }
    setSaving(status);
    try {
      const city = locations[0]?.city || '';
      const state = locations[0]?.state?.label || '';
      const locationStr = city && state ? `${city}, ${state}` : (city || state || 'India');

      await applicationsAPI.upsert({
        internshipId: job.job_id || `TALENTD-${job.id}`,
        status,
        title:          job.role || job.title,
        company:        companyName,
        companyLogo:    companyLogo,
        location:       locationStr,
        domain:         companyCategory || 'General',
        stipend:        job.salary_range?.min ? parseInt(job.salary_range.min, 10) : undefined,
        duration:       empTypes.join(', ') || undefined,
        url:            job.apply_link,
        requiredSkills: skills,
        description:    job.excerpt || job.title,
        postedAt:       job.date?.published,
        source:         'Talentd',
        isRemote:       empTypes.includes('remote') || tags.some(t => t.toLowerCase().includes('remote')),
      });

      setSaved(status);
      showToast(
        status === 'want_to_apply'
          ? '⭐ Added to Want to Apply in Tracker!'
          : '🔖 Added to Wishlist in Tracker!'
      );
    } catch (err) {
      console.error('Save failed:', err);
      showToast('Failed to save to tracker. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm overflow-y-auto"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[80] bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs sm:text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl animate-fade-in border border-slate-700 dark:border-slate-300">
          {toast}
        </div>
      )}

      {/* Modal Container */}
      <div className="relative bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in my-auto">

        {/* Header Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 text-white shrink-0 relative border-b border-indigo-900/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors backdrop-blur-xs"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-4 pr-8">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 p-2 overflow-hidden shadow-sm backdrop-blur-xs">
              <Building2 className="w-7 h-7 text-indigo-300" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  {companyName}
                </span>
                {companyCategory && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/15 text-white/90">
                    {companyCategory}
                  </span>
                )}
                {companyWebsite && (
                  <a
                    href={companyWebsite.startsWith('http') ? companyWebsite : `https://${companyWebsite}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] text-indigo-200 hover:text-white underline ml-1"
                  >
                    <Globe className="w-3 h-3" /> Website
                  </a>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-black text-white leading-tight mb-2">
                {job.role || job.title}
              </h2>

              <div className="flex flex-wrap items-center gap-2">
                {jobTypes.map(t => (
                  <span key={t} className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    {t}
                  </span>
                ))}
                {empTypes.map(t => (
                  <span key={t} className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                    {t.replace('-', ' ')}
                  </span>
                ))}
                {salary && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-200 border border-amber-400/30">
                    {salary}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-slate-800 dark:text-slate-200">

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                <span>Salary Range</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{salary || 'Not Disclosed'}</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
                <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                <span>Experience</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{experienceStr || 'Fresher friendly'}</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Location</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                {locations.length > 0
                  ? locations.map(l => l.city || l.state?.label).filter(Boolean).join(', ')
                  : 'Pan India / Remote'}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>Posted</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{posted || 'Recently'}</p>
            </div>
          </div>

          {/* Eligible Batches & Education */}
          {(batchYears.length > 0 || education.length > 0) && (
            <div className="bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wide">
                <GraduationCap className="w-4 h-4" />
                <span>Eligibility & Batches</span>
              </div>
              {batchYears.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Eligible Batch Years:</span>
                  {batchYears.map(y => (
                    <span key={y} className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800/80">
                      {y}
                    </span>
                  ))}
                </div>
              )}
              {education.length > 0 && (
                <div className="text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Education: </span>
                  {education.join(' · ')}
                </div>
              )}
            </div>
          )}

          {/* Required Skills */}
          {skills.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Required Skills & Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                  <span
                    key={s}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Job Description / Content */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
              Role Description & Responsibilities
            </h3>

            <div className="bg-slate-50/50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 text-sm leading-relaxed space-y-3 prose dark:prose-invert max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-h2:text-base prose-h2:font-bold prose-h3:text-sm prose-h3:font-bold">
              {job.content ? (
                <div
                  dangerouslySetInnerHTML={{ __html: job.content }}
                  className="job-html-content text-slate-700 dark:text-slate-300 space-y-2"
                />
              ) : (
                <p className="text-slate-600 dark:text-slate-400">{job.excerpt || job.title || 'No description provided.'}</p>
              )}
            </div>
          </div>

          {/* About Company */}
          {companyAbout && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                About {companyName}
              </h3>
              <div
                dangerouslySetInnerHTML={{ __html: companyAbout }}
                className="bg-slate-50/50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400 space-y-2"
              />
            </div>
          )}

        </div>

        {/* Action Footer */}
        <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 sm:p-5 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Tracker Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleSave('want_to_apply')}
              disabled={!!saving}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                saved === 'want_to_apply'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              {saved === 'want_to_apply' ? '✓ Saved in Want to Apply' : 'Want to Apply'}
            </button>

            <button
              onClick={() => handleSave('wishlist')}
              disabled={!!saving}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                saved === 'wishlist'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-900/60'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              {saved === 'wishlist' ? '✓ Wishlisted' : 'Wishlist'}
            </button>
          </div>

          {/* Direct Apply Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
            >
              Close
            </button>

            <button
              onClick={handleApply}
              disabled={!job.apply_link}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-40"
            >
              Apply on Company Site <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default JobDetailModal;
