import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import HelpDeskWidget from '../../components/ui/HelpDeskWidget';
import RecommendationPreview from './components/RecommendationPreview';
import CareerPreferencesCard from './components/CareerPreferencesCard';
import InternshipDetailModal from '../../components/InternshipDetailModal';
import { userAPI, internshipAPI, resumeAPI } from '../../services/api';
import {
  Terminal, User, Upload, FileText, Award, Briefcase,
  MapPin, Code, Building2, CheckCircle2, AlertCircle,
  Loader2, X, Plus, Zap, Compass, Sparkles, ArrowRight,
  TrendingUp, Check, ExternalLink
} from 'lucide-react';

const MainDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData]         = useState({ name: '', email: '', profile: {} });
  const [userSkills, setUserSkills]     = useState([]);
  const [internships, setInternships]   = useState([]);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [resumeFileName, setResumeFileName] = useState('');
  const [selectedInternship, setSelectedInternship] = useState(null);

  /* resume upload state */
  const [resumeFile, setResumeFile]       = useState(null);
  const [uploading, setUploading]         = useState(false);
  const [uploadError, setUploadError]     = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  /* ATS score state */
  const [atsScore, setAtsScore]           = useState(null);
  const [atsSkills, setAtsSkills]         = useState([]);

  const resumeInputRef = useRef(null);
  const loadedRef      = useRef(false);

  const handleNavigate = (r) => navigate(r);

  /* ── Load Profile ── */
  const loadUserProfile = async () => {
    try {
      const profileRes = await userAPI.getProfile();
      if (profileRes?.user) {
        const user    = profileRes.user;
        const profile = user?.profile || {};
        const resumeSkills  = Array.isArray(user?.resume?.skills) ? user.resume.skills : [];
        const profileSkills = Array.isArray(profile?.skills)       ? profile.skills    : [];
        const combinedSkills = resumeSkills.length > 0 ? resumeSkills : profileSkills;

        setUserData({ name: user?.name, email: user?.email, profile });
        setUserSkills(combinedSkills);

        const resume    = user?.resume;
        const hasResume = Boolean(resume?.text || resume?.fileName) ||
          (Array.isArray(resume?.skills) && resume.skills.length > 0);
        setResumeUploaded(hasResume);
        setResumeFileName(resume?.fileName || '');

        if (typeof resume?.atsScore === 'number' && resume.atsScore > 0) {
          setAtsScore(resume.atsScore);
          setAtsSkills(resume.skills || []);
        }
        return user;
      }
    } catch (e) { console.error('Profile load error', e); }
    return null;
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) { navigate('/user-login'); return; }
    const load = async () => {
      if (loadedRef.current) return;
      loadedRef.current = true;
      try {
        const user    = await loadUserProfile();
        const profile = user?.profile || {};
        const resumeSkills  = Array.isArray(user?.resume?.skills) ? user.resume.skills : [];
        const profileSkills = Array.isArray(profile?.skills)       ? profile.skills    : [];
        const skills  = resumeSkills.length > 0 ? resumeSkills : profileSkills;

        const latestRes = await internshipAPI.getLatestInternships({
          skills,
          location: profile?.location || '',
          locations: profile?.locations || [],
          domain: profile?.sector || '',
        }).catch(() => null);

        setInternships(Array.isArray(latestRes?.internships) ? latestRes.internships : []);
      } catch (e) { console.error('Dashboard load error', e); }
    };
    load();
  }, [navigate]);

  /* ── Resume File Select ── */
  const handleFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const valid = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!valid.includes(f.type)) { setUploadError('Only PDF or DOCX allowed'); return; }
    if (f.size > 5 * 1024 * 1024) { setUploadError('File must be under 5 MB'); return; }
    setResumeFile(f);
    setUploadError('');
    setUploadSuccess('');
  };

  /* ── Upload Resume ── */
  const handleUploadResume = async () => {
    if (!resumeFile) { setUploadError('Choose a file first'); return; }
    setUploading(true); setUploadError(''); setUploadSuccess('');
    try {
      const data = await resumeAPI.analyze(resumeFile);
      const score = data.atsScore ?? data.profileStrength ?? 0;
      setResumeUploaded(true);
      setResumeFileName(resumeFile.name);
      setAtsScore(Math.round(score));
      setAtsSkills(data?.resume?.skills || []);
      setUploadSuccess(`✅ Resume uploaded & saved! ATS Score: ${Math.round(score)}%`);
      setResumeFile(null);
      if (resumeInputRef.current) resumeInputRef.current.value = '';
      await loadUserProfile();
    } catch (err) {
      setUploadError(err.message || 'Upload failed — please try again.');
    } finally { setUploading(false); }
  };

  /* ── Update Career Preferences (Domain, Locations, Skills) ── */
  const handleUpdatePreferences = async ({ sector, location, locations, skills }) => {
    const newSector = sector !== undefined ? sector : (userData.profile?.sector || '');
    const newLocations = locations !== undefined
      ? locations
      : (location ? location.split(',').map(s => s.trim()).filter(Boolean) : (userData.profile?.locations || []));
    const newLocation = location !== undefined
      ? location
      : (newLocations.length > 0 ? newLocations.join(', ') : (userData.profile?.location || 'Pan India'));
    const newSkills = skills !== undefined ? skills : userSkills;

    // Optimistically update state
    setUserSkills(newSkills);
    const updatedProfile = {
      ...(userData.profile || {}),
      sector: newSector,
      location: newLocation,
      locations: newLocations,
      skills: newSkills,
    };
    setUserData(prev => ({
      ...prev,
      profile: updatedProfile,
    }));

    // Update localStorage and notify components like Sidebar
    try {
      localStorage.setItem('userSkills', JSON.stringify(newSkills));
      const stored = JSON.parse(localStorage.getItem('userData') || '{}');
      if (stored) {
        stored.profile = updatedProfile;
        stored.technicalSkills = newSkills;
        localStorage.setItem('userData', JSON.stringify(stored));
      }
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn('LocalStorage sync warning:', e);
    }

    // Refresh recommendations live with new preferences
    try {
      const latestRes = await internshipAPI.getLatestInternships({
        skills: newSkills,
        location: newLocation,
        locations: newLocations,
        domain: newSector,
      }).catch(() => null);
      setInternships(Array.isArray(latestRes?.internships) ? latestRes.internships : []);
    } catch (e) {
      console.error('Recommendations refresh error:', e);
    }

    // Persist to backend database
    try {
      await userAPI.updateProfile({
        sector: newSector,
        location: newLocation,
        locations: newLocations,
        skills: newSkills,
        technicalSkills: newSkills,
      });
    } catch (err) {
      console.error('Profile update error:', err);
    }
  };

  const locationsList = (Array.isArray(userData?.profile?.locations) && userData.profile.locations.length > 0)
    ? userData.profile.locations
    : (userData?.profile?.location ? userData.profile.location.split(',').map(s => s.trim()).filter(Boolean) : ['Pan India']);

  const locationDisplay = locationsList.length <= 2
    ? locationsList.join(', ')
    : `${locationsList.slice(0, 2).join(', ')} +${locationsList.length - 2}`;

  const stats = [
    { icon: Briefcase, label: 'Live Matches', value: internships.length || 0, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/60' },
    { icon: Code,      label: 'Mapped Skills', value: userSkills.length,       color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/60' },
    { icon: Building2, label: 'Target Domain', value: userData?.profile?.sector   || 'All Sectors', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60' },
    { icon: MapPin,    label: 'Preferred Cities', value: locationDisplay, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/60' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 transition-colors duration-200">

      {selectedInternship && (
        <InternshipDetailModal
          internship={selectedInternship}
          onClose={() => setSelectedInternship(null)}
        />
      )}

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ═══ TWO-COLUMN LAYOUT ═══════════════════════════════════════ */}
        <div className="flex flex-col xl:flex-row gap-6">

          {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* ── COMMAND CENTER HERO ── */}
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden backdrop-blur-sm transition-colors">
              {/* Subtle top accent gradient */}
              <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

              <div className="p-5 sm:p-6 md:p-8">
                {/* Status Bar */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Career Command Center
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/50">
                    Live Platform
                  </span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="max-w-2xl">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-2">
                      Welcome Back, <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{userData.name || 'Candidate'}!</span>
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
                      Explore AI-matched job opportunities, track active applications, and optimize your resume keywords for higher ATS compliance.
                    </p>

                    {/* Quick navigation buttons */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <button
                        onClick={() => navigate('/jobs')}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 hover:shadow-md hover:shadow-indigo-500/30 transition-all active:scale-[0.98]"
                      >
                        <Compass className="w-4 h-4" /> Explore All Jobs
                      </button>
                      <button
                        onClick={() => navigate('/resume-tools')}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all active:scale-[0.98]"
                      >
                        <FileText className="w-4 h-4 text-indigo-500" /> Resume Builder
                      </button>
                      <button
                        onClick={() => navigate('/ai-interview')}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all active:scale-[0.98]"
                      >
                        <Sparkles className="w-4 h-4 text-violet-500" /> AI Interview Prep
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat Chips Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                {stats.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-3 px-4 py-3.5 ${
                        i % 2 === 0 && i !== stats.length - 1 ? 'border-r border-slate-100 dark:border-slate-800' : ''
                      } ${i < 2 ? 'border-b sm:border-b-0 border-slate-100 dark:border-slate-800' : ''} ${
                        i !== 0 && i !== 2 ? 'sm:border-l sm:border-slate-100 dark:border-slate-800' : ''
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                        <Icon className={`w-4 h-4 ${s.color}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{s.label}</div>
                        <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 truncate">{s.value}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── DOCUMENT VAULT + ATS SCORECARD ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* ── Document Vault ── */}
              <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs p-5 sm:p-6 flex flex-col backdrop-blur-sm transition-colors">
                <div className="flex items-center justify-between mb-3.5">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Document Vault</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Active Resume</h2>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center shrink-0 shadow-2xs">
                    <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>

                {/* Status badge */}
                <div className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl mb-4 text-xs font-semibold ${
                  resumeUploaded
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40'
                }`}>
                  {resumeUploaded ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                      <span className="truncate">{resumeFileName || 'Resume uploaded and synchronized'}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                      <span>No resume on file — upload to get tailored jobs</span>
                    </>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  id="dash-resume-upload"
                  onChange={handleFileSelect}
                />

                {/* Selected file preview */}
                {resumeFile ? (
                  <div className="flex items-center gap-2 p-3 rounded-xl mb-3 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/40">
                    <FileText className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                    <span className="flex-1 text-xs font-semibold truncate text-slate-800 dark:text-slate-200">{resumeFile.name}</span>
                    <button
                      onClick={() => { setResumeFile(null); if (resumeInputRef.current) resumeInputRef.current.value = ''; }}
                      className="text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="dash-resume-upload"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl cursor-pointer text-xs sm:text-sm font-bold mb-3 transition-all duration-200 active:scale-[0.98] bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-dashed border-indigo-300 dark:border-indigo-800/70 hover:border-indigo-500"
                  >
                    <Upload className="w-4 h-4 text-indigo-500" />
                    {resumeUploaded ? 'Replace Resume (PDF/DOCX)' : 'Upload Resume (PDF/DOCX)'}
                  </label>
                )}

                {/* Upload Action */}
                {resumeFile && (
                  <button
                    onClick={handleUploadResume}
                    disabled={uploading}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 active:scale-[0.98] disabled:opacity-60 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 mb-2"
                  >
                    {uploading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Uploading &amp; Analyzing…</>
                    ) : (
                      <><Upload className="w-4 h-4" /> Upload &amp; Save to Profile</>
                    )}
                  </button>
                )}

                {uploadError && (
                  <p className="text-xs mt-1 text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {uploadError}
                  </p>
                )}
                {uploadSuccess && (
                  <p className="text-xs mt-1 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {uploadSuccess}
                  </p>
                )}

                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-auto pt-3">
                  Supported formats: PDF, DOCX · Max file size: 5 MB
                </p>
              </div>

              {/* ── ATS Scorecard ── */}
              <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs p-5 sm:p-6 flex flex-col backdrop-blur-sm transition-colors">
                <div className="flex items-center justify-between mb-3.5">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Award className="w-3.5 h-3.5 text-violet-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">Benchmark Engine</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">ATS Scorecard</h2>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/60 flex items-center justify-center shrink-0 shadow-2xs">
                    <Award className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                </div>

                {atsScore !== null ? (
                  <div className="flex flex-col gap-3 flex-1 justify-between">
                    <div>
                      <div className="flex items-baseline gap-2 mb-1.5">
                        <span
                          className="text-4xl sm:text-5xl font-black leading-none"
                          style={{
                            background: atsScore >= 70
                              ? 'linear-gradient(135deg,#10b981,#059669)'
                              : atsScore >= 40
                              ? 'linear-gradient(135deg,#f59e0b,#d97706)'
                              : 'linear-gradient(135deg,#ef4444,#dc2626)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          {atsScore}%
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                          ATS Strength
                        </span>
                      </div>

                      {/* Score bar */}
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-2">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${atsScore}%`,
                            background: atsScore >= 70
                              ? 'linear-gradient(90deg,#34d399,#10b981)'
                              : atsScore >= 40
                              ? 'linear-gradient(90deg,#fbbf24,#f59e0b)'
                              : 'linear-gradient(90deg,#f87171,#ef4444)',
                          }}
                        />
                      </div>

                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {atsScore >= 70 ? '✅ Excellent ATS compatibility for recruiters'
                          : atsScore >= 40 ? '⚠️ Moderate compatibility — optimize keywords'
                          : '❌ Low score — formatting or keywords need overhaul'}
                      </p>

                      {/* Detected skills */}
                      {atsSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {atsSkills.slice(0, 5).map((sk, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-900/50">
                              {sk}
                            </span>
                          ))}
                          {atsSkills.length > 5 && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800">
                              +{atsSkills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => navigate('/ats-analyzer')}
                      className="w-full py-2.5 rounded-2xl text-xs font-bold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/50 hover:bg-violet-100 dark:hover:bg-violet-900/60 border border-violet-200/60 dark:border-violet-900/50 transition-all duration-200 flex items-center justify-center gap-1.5 mt-3"
                    >
                      <Award className="w-3.5 h-3.5" /> Detailed ATS Analysis →
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Award className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">No ATS score yet</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                        {resumeUploaded
                          ? 'Your resume is saved — run ATS analysis to evaluate recruiter visibility'
                          : 'Upload your resume first, then evaluate your keyword score'}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/ats-analyzer')}
                      className="w-full py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-xs transition-all flex items-center justify-center gap-1.5 mt-1"
                    >
                      <Award className="w-3.5 h-3.5" />
                      {resumeUploaded ? 'Calculate ATS Score →' : 'Launch ATS Analyzer →'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── AI RECOMMENDED OPPORTUNITIES ── */}
            <RecommendationPreview
              internships={internships}
              userSkills={userSkills}
              onSelectInternship={(it) => setSelectedInternship(it)}
            />
          </div>

          {/* ── RIGHT COLUMN — Recommendations Setup & Preferences ─────────── */}
          <div className="w-full xl:w-[340px] 2xl:w-[360px] shrink-0 space-y-5">
            <div className="xl:sticky xl:top-6">
              <CareerPreferencesCard
                userData={userData}
                userSkills={userSkills}
                onUpdatePreferences={handleUpdatePreferences}
              />
            </div>
          </div>

        </div>
      </main>

      <HelpDeskWidget />
    </div>
  );
};

export default MainDashboard;