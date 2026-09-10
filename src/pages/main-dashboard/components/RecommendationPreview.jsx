import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowRight, ExternalLink, AlertCircle,
  Search, Building2, MapPin, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * RecommendationPreview with Full Pagination
 *
 * Props:
 *  - internships          : array of scraped internships (already skill-matched from parent)
 *  - userSkills           : string[] — user's skills (from profile/resume)
 *  - onSelectInternship   : (internship) => void — optional callback when a card is clicked
 */
const ITEMS_PER_PAGE = 6;

const RecommendationPreview = ({ internships = [], userSkills = [], onSelectInternship }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const hasSkills = Array.isArray(userSkills) && userSkills.length > 0;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever internships list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [internships]);

  const totalPages = Math.ceil(internships.length / ITEMS_PER_PAGE);
  const validPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const displayList = internships.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Helper to generate pagination numbers with ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (validPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    if (validPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', validPage - 1, validPage, validPage + 1, '...', totalPages];
  };

  // Badge color based on match %
  const badgeClass = (pct) => {
    if (pct >= 90) return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50';
    if (pct >= 75) return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/50';
    if (pct >= 50) return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/50';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
  };

  /* ─── No Skills State ──────────────────────────────────────────────── */
  if (!hasSkills) {
    return (
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs p-6 backdrop-blur-sm transition-colors">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {t('dashboard.recommendations.title') || 'Personalized Matches'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Add your skills to unlock tailored job recommendations</p>
          </div>
        </div>

        <div className="mt-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl p-6 text-center">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">
            Profile skills needed
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-sm mx-auto">
            We match jobs based on the skills in your profile and resume. Update your skills in the setup card to unlock recommendations.
          </p>
          <button
            onClick={() => navigate('/user-profile-management')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all active:scale-[0.98]"
          >
            Add Skills to Profile <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  /* ─── Empty (skills set, but no data yet) ──────────────────────────── */
  if (internships.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs p-6 backdrop-blur-sm transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t('dashboard.recommendations.title') || 'Personalized Matches'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Curated opportunities for your profile</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/jobs')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all"
          >
            Browse All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <Search className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-500 mb-2" />
          <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">
            Fetching internships matched to your skills...
          </p>
        </div>
      </div>
    );
  }

  /* ─── Recommendations List with Pagination ──────────────────────────── */
  return (
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs p-5 sm:p-6 backdrop-blur-sm transition-colors space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {t('dashboard.recommendations.title') || 'Personalized Matches'}
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/50">
                {internships.length} available
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span>Matched against:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {userSkills.slice(0, 3).join(', ')}{userSkills.length > 3 ? ` +${userSkills.length - 3} more` : ''}
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/jobs')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all active:scale-[0.98] shrink-0"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Cards List */}
      <div className="space-y-2.5">
        {displayList.map((internship, idx) => {
          const company = typeof internship.company === 'string'
            ? internship.company
            : (internship.company?.name || internship.company?.display_name || internship.company_name || 'Tech Company');
          const logo = internship.company?.logo || internship.companyLogo;
          const matchPct = typeof internship.matchPercentage === 'number'
            ? Math.min(100, Math.round(internship.matchPercentage))
            : typeof internship.matchScore === 'number'
            ? Math.min(100, Math.round(internship.matchScore))
            : null;

          return (
            <div
              key={internship.id || internship._id || `${validPage}-${idx}`}
              className="flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all duration-200 group cursor-pointer"
              onClick={() => {
                if (onSelectInternship) {
                  onSelectInternship(internship);
                } else if (internship.url) {
                  window.open(internship.url, '_blank', 'noopener');
                }
              }}
            >
              {/* Logo */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-center bg-white dark:bg-slate-800 shrink-0 overflow-hidden shadow-2xs">
                {logo && !logo.includes('backend.talentd.in') ? (
                  <img src={logo} alt={company} className="w-6 h-6 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <span className="font-black text-sm text-indigo-600 dark:text-indigo-400">
                    {(company || '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {internship.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-2 mt-0.5">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{company}</span>
                  {internship.location && (
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                      <MapPin className="w-3 h-3" /> {internship.location}
                    </span>
                  )}
                </p>
              </div>

              {/* Match badge */}
              {matchPct !== null && (
                <div className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ${badgeClass(matchPct)}`}>
                  {matchPct}% match
                </div>
              )}

              <ExternalLink className="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            </div>
          );
        })}
      </div>

      {/* ── PAGINATION CONTROLS ── */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing <span className="font-bold text-slate-800 dark:text-slate-200">{startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, internships.length)}</span> of <span className="font-bold text-slate-800 dark:text-slate-200">{internships.length}</span> recommendations
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={validPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            {/* Page number buttons */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, i) => {
                if (page === '...') {
                  return (
                    <span key={`dots-${i}`} className="px-1 text-xs text-slate-400">
                      …
                    </span>
                  );
                }
                const isActive = page === validPage;
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={validPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-2xs"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Live data note */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-[11px] text-slate-400 dark:text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time scraped &amp; matched from top portals</span>
        </div>
        <button
          onClick={() => navigate('/jobs')}
          className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
        >
          Explore All →
        </button>
      </div>
    </div>
  );
};

export default RecommendationPreview;