import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search, SlidersHorizontal, ChevronDown, MapPin,
  Clock, ExternalLink, Briefcase, Building2,
  ArrowLeft, ArrowRight, Loader2, AlertCircle, X,
  Compass, Eye, Sparkles, Filter
} from 'lucide-react';
import { fetchTalentdJobs, formatSalary, timeAgo } from '../../services/talentdAPI';
import JobDetailModal from '../../components/JobDetailModal';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  'IT/Software', 'Core Engineering', 'Banking & Finance',
  'BPO/Customer Support', 'Sales & Marketing', 'HR & Admin',
  'Design', 'Healthcare & Pharma', 'Manufacturing & Operations',
  'Research & Science',
];

const QUICK_CHIPS = [
  { label: 'All Jobs',       action: 'all' },
  { label: 'Internships',    action: 'internship' },
  { label: 'Fresher Jobs',   action: 'fresher' },
  { label: 'Remote',         filter: { employment_type: 'remote' } },
  { label: 'IT/Software',    filter: { category: 'IT/Software' } },
  { label: 'Full Time',      filter: { employment_type: 'full-time' } },
  { label: 'Design',         filter: { category: 'Design' } },
  { label: 'Sales & Marketing', filter: { category: 'Sales & Marketing' } },
];

const ITEMS_PER_PAGE = 20;

// ─── Company Logo ─────────────────────────────────────────────────────────────
const CompanyLogo = ({ name, logo, website }) => {
  const [err, setErr] = useState(false);
  const initials = (name || 'Co').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'CO';

  let logoSrc = null;
  if (!err) {
    if (logo && typeof logo === 'string' && logo.startsWith('http') && !logo.includes('backend.talentd.in')) {
      logoSrc = logo;
    } else if (website) {
      try {
        const url = new URL(website.startsWith('http') ? website : `https://${website}`);
        const domain = url.hostname.replace(/^www\./, '');
        if (domain && domain.includes('.')) {
          logoSrc = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        }
      } catch (_) {}
    }
  }

  const gradients = [
    'from-indigo-600 to-violet-600',
    'from-blue-600 to-indigo-600',
    'from-emerald-600 to-teal-600',
    'from-amber-600 to-orange-600',
    'from-violet-600 to-purple-600',
  ];
  const colorIdx = (name || 'A').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % gradients.length;

  if (!logoSrc || err) {
    return (
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradients[colorIdx]} flex items-center justify-center shrink-0 shadow-2xs`}>
        <span className="text-sm font-bold text-white tracking-wider">{initials}</span>
      </div>
    );
  }

  return (
    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-center shrink-0 p-2 overflow-hidden shadow-2xs">
      <img
        src={logoSrc}
        alt={name || 'Company'}
        onError={() => setErr(true)}
        className="w-full h-full object-contain"
        loading="lazy"
      />
    </div>
  );
};

// ─── Job Card ─────────────────────────────────────────────────────────────────
const JobCard = ({ job, onSelect }) => {
  const salary = formatSalary(job.salary_range);
  const posted = timeAgo(job.date?.published);
  const city   = job.locations?.[0]?.city || '';
  const isNew  = (Date.now() - new Date(job.date?.published).getTime()) < 86400000 * 2;

  return (
    <div
      onClick={() => onSelect(job)}
      className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400/50 dark:hover:border-indigo-500/50 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md dark:hover:shadow-slate-950/60 transition-all duration-200 group cursor-pointer relative"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <CompanyLogo
          name={job.company?.company_name || job.company?.name}
          logo={job.company?.company_logo || job.companyLogo || job.logo}
          website={job.company?.company_website || job.company_website}
        />

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {job.role || job.title}
              </h3>
              {isNew && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500 text-white shrink-0 shadow-2xs">
                  NEW
                </span>
              )}
            </div>
            {salary && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0 whitespace-nowrap bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-900/40">
                {salary}
              </span>
            )}
          </div>

          {/* Company + location */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2.5">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate font-semibold text-slate-700 dark:text-slate-300">{job.company?.company_name || job.company?.name}</span>
            {city && (
              <>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{city}</span>
              </>
            )}
          </div>

          {/* Type badges */}
          <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
            <Briefcase className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
            {job.job_type?.map(t => (
              <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/50">
                {t}
              </span>
            ))}
            {job.employment_type?.map(t => (
              <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60">
                {t.replace('-', ' ')}
              </span>
            ))}
          </div>

          {/* Skills */}
          {job.skills?.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {job.skills.slice(0, 4).map(s => (
                <span key={s} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100/80 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 text-slate-600 dark:text-slate-300">
                  {s}
                </span>
              ))}
              {job.skills.length > 4 && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">+{job.skills.length - 4} more</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-[11px]">
          <Clock className="w-3 h-3" />
          <span>{posted}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center gap-1">
            <Eye className="w-3 h-3" /> View Details
          </span>

          <a
            href={job.apply_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-all active:scale-95"
            onClick={e => e.stopPropagation()}
          >
            Apply <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

// ─── Filter Dropdown ──────────────────────────────────────────────────────────
const FilterDropdown = ({ label, options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedOpt = options.find(o => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap cursor-pointer shadow-2xs
          ${value
            ? 'bg-white text-primary border-white font-bold shadow-xs dark:bg-indigo-600 dark:text-white dark:border-indigo-500'
            : 'bg-white/15 text-white border-white/30 hover:bg-white/25 dark:bg-slate-800/90 dark:text-slate-200 dark:border-slate-700/80 dark:hover:bg-slate-750'}`}
      >
        {selectedOpt?.label || label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-1.5 left-0 min-w-[180px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in p-1">
          <button
            className="flex items-center w-full px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-left"
            onClick={() => { onChange(''); setOpen(false); }}
          >
            All
          </button>
          {options.map(opt => (
            <button
              key={opt.value}
              className={`flex items-center w-full px-3 py-2 text-xs rounded-xl transition-colors text-left
                ${value === opt.value
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/50'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Jobs Page ───────────────────────────────────────────────────────────
const AllJobs = ({
  defaultJobType = '',
  pageTitle = 'Find Your Dream Job',
  pageSubtitle = 'Discover live job opportunities from top companies. Filter by experience, work mode, and category.'
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [jobs, setJobs]             = useState([]);
  const [totalJobs, setTotalJobs]   = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [page, setPage]             = useState(1);
  const [jumpInput, setJumpInput]   = useState('');
  const [selectedJob, setSelectedJob] = useState(null);

  // Filters
  const [search, setSearch]               = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [jobType, setJobType]             = useState(defaultJobType);
  const [category, setCategory]           = useState('');
  const [employmentType, setEmploymentType] = useState('');

  // Sync with route changes
  useEffect(() => {
    if (location.pathname === '/jobs/internships') {
      setJobType('Internship');
    } else if (location.pathname === '/jobs/freshers') {
      setJobType('Fresher');
    } else if (location.pathname === '/jobs') {
      setJobType('');
    }
  }, [location.pathname]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Load jobs
  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchTalentdJobs({
        page,
        limit: ITEMS_PER_PAGE,
        job_type:        jobType        || undefined,
        category:        category       || undefined,
        employment_type: employmentType || undefined,
        search:          debouncedSearch || undefined,
      });

      const rawJobs = Array.isArray(data.jobs) ? data.jobs : [];
      const total = Number(data.meta?.total_jobs ?? data.total ?? rawJobs.length);
      const pages = Number(data.meta?.total_pages ?? data.totalPages ?? Math.max(1, Math.ceil(total / ITEMS_PER_PAGE)));

      setJobs(rawJobs);
      setTotalJobs(total);
      setTotalPages(pages);
    } catch (e) {
      setError(e.message || 'Failed to load jobs');
      setJobs([]);
      setTotalJobs(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, jobType, category, employmentType, debouncedSearch]);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [jobType, category, employmentType, debouncedSearch]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJumpSubmit = (e) => {
    e.preventDefault();
    const target = parseInt(jumpInput, 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      handlePageChange(target);
      setJumpInput('');
    }
  };

  // Job Type selector that syncs with route & sidebar
  const handleJobTypeChange = (newType) => {
    if (newType === 'Internship') {
      navigate('/jobs/internships');
    } else if (newType === 'Fresher') {
      navigate('/jobs/freshers');
    } else {
      navigate('/jobs');
    }
  };

  const applyChip = (chip) => {
    if (chip.action === 'all') {
      navigate('/jobs');
      setCategory('');
      setEmploymentType('');
      setSearch('');
    } else if (chip.action === 'internship') {
      navigate('/jobs/internships');
    } else if (chip.action === 'fresher') {
      navigate('/jobs/freshers');
    } else if (chip.filter?.category) {
      setCategory(chip.filter.category);
    } else if (chip.filter?.employment_type) {
      setEmploymentType(chip.filter.employment_type);
    }
  };

  const clearFilters = () => {
    setCategory('');
    setEmploymentType('');
    setSearch('');
    if (location.pathname !== '/jobs') {
      navigate('/jobs');
    } else {
      setJobType('');
    }
  };

  const hasFilters = jobType !== defaultJobType || category || employmentType || debouncedSearch;

  // Pagination window
  const pageWindow = () => {
    const pages = [];
    const delta = 2;
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) pages.push(i);
    return pages;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">

      {/* ── Banner: Blue in Light Mode, Dark Slate in Dark Mode ─────────────────────────── */}
      <div className="bg-primary dark:bg-[#0c1322] dark:border-b dark:border-slate-800 text-white dark:text-slate-100 relative transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-6 pb-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/15 text-white/95 border border-white/20 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-400/20">
                Talentd Live Network
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{pageTitle}</h1>
            <p className="text-xs sm:text-sm text-white/80 dark:text-slate-400 mt-1 max-w-2xl">{pageSubtitle}</p>
          </div>

          {/* Search + Filters row */}
          <div className="py-3 flex flex-wrap items-center gap-2.5">
            {/* Search bar */}
            <form className="relative w-full sm:max-w-sm" onSubmit={e => e.preventDefault()}>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/60 dark:text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search jobs, skills, companies…"
                className="w-full pl-10 pr-4 py-2 bg-white/15 text-white border border-white/25 rounded-xl placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/20 dark:bg-slate-800/80 dark:text-white dark:border-slate-700/80 dark:placeholder:text-slate-400 dark:focus:ring-indigo-500/40 text-xs sm:text-sm shadow-2xs transition-all"
              />
            </form>

            {/* Filter dropdowns (desktop) */}
            <div className="flex items-center gap-2 flex-wrap">
              <FilterDropdown
                label="Job Type"
                value={jobType}
                onChange={handleJobTypeChange}
                options={[
                  { value: '', label: 'All Jobs' },
                  { value: 'Internship', label: 'Internships' },
                  { value: 'Fresher', label: 'Fresher Jobs' },
                ]}
              />
              <FilterDropdown
                label="Category"
                value={category}
                onChange={setCategory}
                options={CATEGORIES.map(c => ({ value: c, label: c }))}
              />
              <FilterDropdown
                label="Work Mode"
                value={employmentType}
                onChange={setEmploymentType}
                options={[
                  { value: 'full-time', label: 'Full Time' },
                  { value: 'part-time', label: 'Part Time' },
                  { value: 'remote', label: 'Remote' },
                  { value: 'contract', label: 'Contract' },
                ]}
              />

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-white/15 border border-white/30 hover:bg-white/25 dark:bg-slate-800/90 dark:text-slate-300 dark:border-slate-700/80 dark:hover:bg-slate-750 dark:hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Quick-filter chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-4 scrollbar-hide">
            {QUICK_CHIPS.map(chip => (
              <button
                key={chip.label}
                type="button"
                onClick={() => applyChip(chip)}
                className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer bg-white/10 text-white/85 border-white/20 hover:bg-white/20 hover:text-white dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700/60 dark:hover:bg-slate-750 dark:hover:text-white shrink-0 shadow-2xs"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">

        {/* Result count */}
        <div className="mb-4">
          {loading ? (
            <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Showing <span className="font-bold text-slate-900 dark:text-slate-100">{totalJobs > 0 ? (page - 1) * ITEMS_PER_PAGE + 1 : 0}</span> – <span className="font-bold text-slate-900 dark:text-slate-100">{Math.min(page * ITEMS_PER_PAGE, totalJobs)}</span> of <span className="font-bold text-slate-900 dark:text-slate-100">{totalJobs.toLocaleString()}</span> opportunities
                {hasFilters && (
                  <button onClick={clearFilters} className="ml-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold">
                    Clear filters
                  </button>
                )}
              </p>
              {totalPages > 1 && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Page <span className="font-bold text-slate-900 dark:text-slate-100">{page}</span> of <span className="font-bold text-slate-900 dark:text-slate-100">{totalPages.toLocaleString()}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl mb-4 text-sm text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
            <button onClick={loadJobs} className="ml-auto px-3 py-1 rounded-xl bg-rose-100 dark:bg-rose-900/50 hover:bg-rose-200 text-xs font-bold transition-colors">
              Retry
            </button>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-3.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2.5">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    <div className="flex gap-2">
                      <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
                      <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Job cards */}
        {!loading && !error && (
          <>
            {jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">No roles found matching filters</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Try broadening your search or resetting applied filters.</p>
                </div>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {jobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onSelect={setSelectedJob}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-8 pb-8">
                {/* Prev */}
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:pointer-events-none shadow-2xs"
                  aria-label="Previous page"
                  title="Previous page"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                {/* Page 1 */}
                {page > 3 && (
                  <>
                    <button
                      onClick={() => handlePageChange(1)}
                      className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      1
                    </button>
                    {page > 4 && <span className="text-slate-400 px-1 select-none">…</span>}
                  </>
                )}

                {/* Middle window of page buttons */}
                {pageWindow().map(p => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-9 h-9 rounded-xl border text-xs font-bold transition-all
                      ${p === page
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    aria-current={p === page ? 'page' : undefined}
                  >
                    {p}
                  </button>
                ))}

                {/* Last page */}
                {page < totalPages - 2 && (
                  <>
                    {page < totalPages - 3 && <span className="text-slate-400 px-1 select-none">…</span>}
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="min-w-9 h-9 px-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                {/* Next */}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:pointer-events-none shadow-2xs"
                  aria-label="Next page"
                  title="Next page"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Quick jump to page */}
                <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5 ml-2">
                  <span className="text-xs text-slate-400 hidden sm:inline font-medium">Go to:</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={jumpInput}
                    onChange={e => setJumpInput(e.target.value)}
                    placeholder={page.toString()}
                    className="w-14 px-2 py-1.5 text-xs text-center border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    aria-label="Jump to page"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                  >
                    Go
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Job Detail Modal ─────────────────────────────── */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
};

export default AllJobs;
