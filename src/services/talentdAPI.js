/**
 * talentdAPI.js
 * Calls our Express backend which proxies requests to brain.talentd.in
 */

// VITE_API_URL may already include /api (e.g. http://localhost:5000/api)
// We strip that suffix so we can build full paths ourselves
const _rawBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_BASE = _rawBase.replace(/\/api\/?$/, '');


/**
 * Fetch jobs from our backend proxy.
 * @param {Object} params - { page, limit, job_type, category, employment_type, location, search, sort }
 */
export async function fetchTalentdJobs(params = {}) {
  const query = new URLSearchParams();
  if (params.page)            query.set('page', params.page);
  if (params.limit)           query.set('limit', params.limit || 20);
  if (params.job_type)        query.set('job_type', params.job_type);
  if (params.category)        query.set('category', params.category);
  if (params.employment_type) query.set('employment_type', params.employment_type);
  if (params.location)        query.set('location', params.location);
  if (params.search)          query.set('search', params.search);
  if (params.sort)            query.set('sort', params.sort);

  const res = await fetch(`${BACKEND_BASE}/api/talentd/jobs?${query.toString()}`);
  if (!res.ok) throw new Error(`Jobs fetch failed: ${res.status}`);
  return res.json(); // { jobs: [...], meta: { total_jobs, total_pages, current_page, per_page } }
}

/**
 * Fetch job stats (counts by category/city).
 */
export async function fetchTalentdStats() {
  const res = await fetch(`${BACKEND_BASE}/api/talentd/stats`);
  if (!res.ok) throw new Error(`Stats fetch failed: ${res.status}`);
  return res.json();
}

/**
 * Fetch total counts for all jobs, internships, freshers.
 */
export async function fetchTalentdCounts() {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/talentd/counts`);
    if (!res.ok) return { all: 4264, internships: 1468, freshers: 2789 };
    return await res.json();
  } catch (_) {
    return { all: 4264, internships: 1468, freshers: 2789 };
  }
}

/**
 * Build the full company logo URL from the logo filename stored in the API response.
 * e.g. "amber_128.jpg" → full CDN URL
 */
export function getCompanyLogoUrl(companyOrWebsite) {
  if (!companyOrWebsite) return null;
  const site = typeof companyOrWebsite === 'string' ? companyOrWebsite : companyOrWebsite?.company_website;
  if (site && typeof site === 'string' && site.includes('.')) {
    try {
      const url = new URL(site.startsWith('http') ? site : `https://${site}`);
      const domain = url.hostname.replace(/^www\./, '');
      if (domain && domain.includes('.')) {
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      }
    } catch (_) {}
  }
  return null;
}

/**
 * Format salary range for display.
 * e.g. { min: "600000", max: "1200000" } → "₹6L – ₹12L PA"
 */
export function formatSalary(salaryRange) {
  if (!salaryRange) return null;
  const { min, max } = salaryRange;
  const minNum = parseInt(min, 10);
  const maxNum = parseInt(max, 10);
  if (!minNum && !maxNum) return null;

  const fmt = (n) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`;
    if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${n}`;
  };

  if (minNum && maxNum && minNum !== maxNum) return `${fmt(minNum)} – ${fmt(maxNum)} PA`;
  if (maxNum) return `${fmt(maxNum)} PA`;
  if (minNum) return `${fmt(minNum)} PA`;
  return null;
}

/**
 * Return a human-readable "X hours/days ago" string.
 */
export function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
