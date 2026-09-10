import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeAPI, userAPI } from '../../services/api';
import {
  Target,
  FileText,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Briefcase,
  GraduationCap,
  Code2,
  Brain,
  Compass,
  Layers,
  Award,
  TrendingUp,
  Loader2,
  RotateCcw,
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileSearch,
} from 'lucide-react';

/* ─── Helpers ─────────────────────────────────────────────────────────── */
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const getScoreDetails = (pct) => {
  if (pct >= 80) return {
    label: 'Excellent',
    color: 'text-emerald-600 dark:text-emerald-400',
    bar: 'bg-emerald-500',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    stroke: '#10b981',
  };
  if (pct >= 60) return {
    label: 'Good',
    color: 'text-indigo-600 dark:text-indigo-400',
    bar: 'bg-indigo-600',
    border: 'border-indigo-200 dark:border-indigo-800/60',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    stroke: '#6366f1',
  };
  if (pct >= 50) return {
    label: 'Fair',
    color: 'text-amber-600 dark:text-amber-400',
    bar: 'bg-amber-500',
    border: 'border-amber-200 dark:border-amber-800/60',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    stroke: '#f59e0b',
  };
  return {
    label: 'Needs Work',
    color: 'text-rose-600 dark:text-rose-400',
    bar: 'bg-rose-500',
    border: 'border-rose-200 dark:border-rose-800/60',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    stroke: '#ef4444',
  };
};

/* ─── Circular Score Gauge ─────────────────────────────────────────────── */
const ScoreGauge = ({ score }) => {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const pct = clamp(score, 0, 100);
  const offset = circ - (pct / 100) * circ;
  const details = getScoreDetails(pct);

  return (
    <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
      <svg className="w-44 h-44 -rotate-90">
        <circle cx="88" cy="88" r={r} fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="12" />
        <circle
          cx="88" cy="88" r={r} fill="none"
          stroke={details.stroke} strokeWidth="12"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`text-4xl font-black tabular-nums tracking-tight ${details.color}`}>{pct}</span>
        <span className="text-xs font-semibold text-slate-400 mt-0.5">/ 100</span>
        <span className={`mt-2 text-xs font-bold px-2.5 py-0.5 rounded-full border ${details.bg} ${details.color} ${details.border}`}>
          {details.label}
        </span>
      </div>
    </div>
  );
};

/* ─── Score Bar Component ───────────────────────────────────────────────── */
const ScoreBar = ({ label, score, maxScore, icon: IconComp }) => {
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const details = getScoreDetails(pct);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
          {IconComp && <IconComp className="w-3.5 h-3.5 text-slate-400" />}
          <span>{label}</span>
        </span>
        <span className={`font-bold tabular-nums ${details.color}`}>
          {score} <span className="text-slate-400 font-normal">/ {maxScore}</span>
        </span>
      </div>
      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${details.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

/* ─── Tag / Chip Component ──────────────────────────────────────────────── */
const Chip = ({ label, variant = 'green' }) => {
  const variantStyles = {
    green: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    red: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
    amber: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${variantStyles[variant] || variantStyles.indigo}`}>
      {label}
    </span>
  );
};

/* ─── Section Card Wrapper ─────────────────────────────────────────────── */
const SectionCard = ({ title, icon: IconComp, children, badge }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-2.5">
        {IconComp && (
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <IconComp className="w-4 h-4" />
          </div>
        )}
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
      </div>
      {badge && <div>{badge}</div>}
    </div>
    {children}
  </div>
);

/* ─── Section Detected Item ────────────────────────────────────────────── */
const SectionCheck = ({ label, checked }) => (
  <div className="flex items-center gap-2 py-1">
    <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
      checked
        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
    }`}>
      {checked ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
    </div>
    <span className={`text-xs ${checked ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
      {label}
    </span>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN ATS ANALYZER COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const AtsAnalyzer = ({ inTab = false }) => {
  const navigate = useNavigate();

  /* ─── State ─── */
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [useStoredResume, setUseStoredResume] = useState(true);
  const [hasStoredResume, setHasStoredResume] = useState(false);
  const [storedResumeName, setStoredResumeName] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [showJdDetails, setShowJdDetails] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    let isActive = true;

    const loadProfile = async () => {
      try {
        const profileRes = await userAPI.getProfile().catch(() => null);
        const resumeData = profileRes?.user?.resume;
        const savedResumeText = resumeData?.text || '';
        const savedName = resumeData?.fileName || 'Resume on file';
        const savedExists = savedResumeText.trim().length > 30 || Boolean(resumeData?.fileName);

        if (isActive) {
          setHasStoredResume(savedExists);
          setStoredResumeName(savedName);
          if (!savedExists) setUseStoredResume(false);
        }
      } catch {
        if (isActive) {
          setHasStoredResume(false);
          setUseStoredResume(false);
        }
      }
    };

    loadProfile();
    return () => {
      isActive = false;
    };
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      setError('Please upload a PDF or DOCX file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Resume file size must be less than 5 MB.');
      return;
    }
    setResumeFile(file);
    setError('');
  }, []);

  const handleAnalyze = async () => {
    setError('');
    setResult(null);

    const hasFile = !useStoredResume && resumeFile;
    const hasJD = jobDescription.trim().length > 30;

    if (useStoredResume) {
      if (!hasStoredResume) {
        setError('No saved resume found in your profile. Please upload a resume file instead.');
        return;
      }
    } else if (!hasFile) {
      setError('Please select or upload a resume file to analyze.');
      return;
    }

    if (!hasJD) {
      setError('Please paste the job description to run the ATS matching analysis.');
      return;
    }

    setLoading(true);
    try {
      setStep('extracting');
      await new Promise(r => setTimeout(r, 600));
      setStep('analyzing');

      const data = await resumeAPI.atsAnalyze({
        file: hasFile ? resumeFile : null,
        jobDescription,
        useStoredResume,
      });

      setResult(data);
      setTimeout(() => {
        document.getElementById('ats-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    } catch (err) {
      setError(err.message || 'ATS analysis failed. Please verify your inputs and try again.');
    } finally {
      setLoading(false);
      setStep('');
    }
  };

  const jdLen = jobDescription.length;
  const hasJD = jdLen > 30;
  const hasResumeSource = useStoredResume ? hasStoredResume : Boolean(resumeFile);
  const canAnalyze = hasResumeSource && hasJD && !loading;

  return (
    <div className={`w-full ${inTab ? '' : 'min-h-screen bg-background text-foreground'}`}>

      <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${inTab ? 'py-4' : 'py-6 sm:py-8'} space-y-6`}>

        {/* ── Page Title Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                ATS Resume Analyzer
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI two-step engine: extracts JD requirements & scores resume against ATS filters
              </p>
            </div>
          </div>

          {!inTab && (
            <button
              onClick={() => navigate('/resume-tools')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Resume Builder</span>
            </button>
          )}
        </div>

        {/* ── Main Two-Column Layout ── */}
        <div className={`grid grid-cols-1 ${result ? 'lg:grid-cols-12' : 'max-w-3xl mx-auto'} gap-6 items-start`}>

          {/* ════ LEFT: Input Card ════ */}
          <div className={`${result ? 'lg:col-span-5' : 'w-full'} space-y-5`}>

            {/* Pipeline Steps Indicator Banner */}
            <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/60 rounded-2xl p-4">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-2">
                2-Step Intelligence Process
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100/60 dark:border-indigo-900/50">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Extract JD Criteria</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100/60 dark:border-indigo-900/50">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Score & Benchmark</span>
                </div>
              </div>
            </div>

            {/* Resume Selection Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Resume Source</h3>
                </div>
                {hasStoredResume && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                    Profile Resume Ready
                  </span>
                )}
              </div>

              {/* Checkbox toggle for Profile Resume */}
              <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                useStoredResume
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800'
                  : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
              }`}>
                <input
                  type="checkbox"
                  checked={useStoredResume}
                  onChange={(e) => setUseStoredResume(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div className="flex-1 text-xs">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Use saved resume from my profile
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 mt-0.5 block leading-relaxed">
                    {hasStoredResume
                      ? `Using: ${storedResumeName}`
                      : 'No saved resume found. Uncheck to upload a document.'}
                  </span>
                </div>
              </label>

              {/* Upload Zone (when useStoredResume is false) */}
              {!useStoredResume && (
                <div
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                    resumeFile
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center mx-auto mb-2 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/60 dark:border-slate-700">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {resumeFile ? resumeFile.name : 'Click to select a resume'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">PDF or DOCX (Max 5 MB)</p>
                </div>
              )}
            </div>

            {/* Job Description Input Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Target Job Description</h3>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                  hasJD
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60'
                }`}>
                  {hasJD ? 'Ready' : 'Required'}
                </span>
              </div>

              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description or requirements here to enable keyword and skill benchmark matching..."
                rows={7}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white p-3 text-xs leading-relaxed focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-y placeholder:text-slate-400"
              />

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <span>{hasJD ? 'Job description detected' : 'Minimum 30 characters recommended'}</span>
                <span className={jdLen > 4500 ? 'text-rose-500 font-bold' : ''}>{jdLen} / 5000</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}

            {/* Action Button */}
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {step === 'extracting' ? 'Extracting Requirements...' : 'Evaluating Resume Against JD...'}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run ATS Benchmark Analysis</span>
                </>
              )}
            </button>
          </div>

          {/* ════ RIGHT: Results Panel ════ */}
          {result && (
            <div id="ats-results" className="lg:col-span-7 space-y-5 animate-in fade-in slide-in-from-bottom duration-500">

              {/* Two-step Success Banner */}
              {result.jdExtracted && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-semibold">
                    JD criteria successfully extracted and cross-referenced with your resume.
                  </span>
                </div>
              )}

              {/* Overall Score Gauge Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-4">
                  Overall ATS Match Score
                </span>
                <ScoreGauge score={result.atsScore} />
                {result.summary && (
                  <p className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 text-xs leading-relaxed text-left">
                    {result.summary}
                  </p>
                )}
              </div>

              {/* Detailed Breakdown */}
              <SectionCard title="Scoring Breakdown" icon={Award}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ScoreBar label="Skill Match" score={result.skillMatchScore} maxScore={30} icon={Code2} />
                  <ScoreBar label="Experience Relevance" score={result.experienceScore} maxScore={20} icon={Briefcase} />
                  <ScoreBar label="Project Relevance" score={result.projectScore} maxScore={15} icon={Layers} />
                  <ScoreBar label="Keyword Coverage" score={result.keywordCoverageScore} maxScore={20} icon={FileSearch} />
                  <ScoreBar label="Education" score={result.educationScore} maxScore={5} icon={GraduationCap} />
                  <ScoreBar label="Structure & ATS Formatting" score={result.structureScore} maxScore={5} icon={Check} />
                </div>
              </SectionCard>

              {/* Skills Analysis */}
              <SectionCard title="Skills Alignment" icon={Brain}>
                <div className="space-y-4">
                  {result.matchedSkills?.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-2">
                        Matched Skills ({result.matchedSkills.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {result.matchedSkills.map((s, i) => (
                          <Chip key={i} label={s} variant="green" />
                        ))}
                      </div>
                    </div>
                  )}

                  {result.missingSkills?.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-2">
                        Missing Required Skills ({result.missingSkills.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {result.missingSkills.map((s, i) => (
                          <Chip key={i} label={s} variant="red" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </SectionCard>

              {/* Keywords Coverage */}
              {(result.matchedKeywords?.length > 0 || result.missingKeywords?.length > 0) && (
                <SectionCard title="Keyword Coverage" icon={FileSearch}>
                  <div className="space-y-4">
                    {result.matchedKeywords?.length > 0 && (
                      <div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-2">
                          Found in Resume
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {result.matchedKeywords.map((k, i) => (
                            <Chip key={i} label={k} variant="green" />
                          ))}
                        </div>
                      </div>
                    )}
                    {result.missingKeywords?.length > 0 && (
                      <div>
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-2">
                          Not Found in Resume
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {result.missingKeywords.map((k, i) => (
                            <Chip key={i} label={k} variant="red" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </SectionCard>
              )}

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.strengths?.length > 0 && (
                  <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/50 rounded-2xl p-4 sm:p-5 space-y-2">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block mb-1">
                      Strengths
                    </span>
                    <ul className="space-y-1.5">
                      {result.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.weaknesses?.length > 0 && (
                  <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/50 rounded-2xl p-4 sm:p-5 space-y-2">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider block mb-1">
                      Improvement Areas
                    </span>
                    <ul className="space-y-1.5">
                      {result.weaknesses.map((w, i) => (
                        <li key={i} className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-2">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Actionable Recommendations */}
              {result.recommendations?.length > 0 && (
                <SectionCard title="Actionable Recommendations" icon={TrendingUp}>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          {i + 1}
                        </span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              )}

              {/* Detected Resume Sections */}
              {result.resumeSections && Object.keys(result.resumeSections).length > 0 && (
                <SectionCard title="Standard Resume Sections Detected" icon={Layers}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(result.resumeSections).map(([key, val]) => (
                      <SectionCheck
                        key={key}
                        label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                        checked={Boolean(val)}
                      />
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Career Growth Path */}
              {(result.missingSkills?.length > 0 || result.recommendedLearningTopics?.length > 0 || result.recommendedInternshipDomains?.length > 0) && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Career Bridge Pathway</h3>
                      <p className="text-[11px] text-slate-400">Target missing skills and match relevant internship tracks</p>
                    </div>
                  </div>

                  {result.recommendedLearningTopics?.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        Recommended Learning Topics
                      </span>
                      <div className="space-y-1.5">
                        {result.recommendedLearningTopics.map((topic, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <span>{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.recommendedInternshipDomains?.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        Matching Internship Categories
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {result.recommendedInternshipDomains.map((domain, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => navigate('/jobs/internships')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <span>{domain}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Extracted JD Requirements Details Accordion */}
              {result.jdExtracted && result.jdRequirements && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowJdDetails(!showJdDetails)}
                    className="w-full flex items-center justify-between p-4 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <FileSearch className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Extracted Job Requirements (Step 1 Output)</span>
                    </span>
                    {showJdDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showJdDetails && (
                    <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      {Object.entries(result.jdRequirements).map(([key, val]) =>
                        Array.isArray(val) && val.length > 0 ? (
                          <div key={key} className="space-y-1">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                              {key.replace(/([A-Z])/g, ' $1')}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {val.map((v, i) => (
                                <Chip key={i} label={v} variant="indigo" />
                              ))}
                            </div>
                          </div>
                        ) : null
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Re-analyze Button */}
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-xs uppercase tracking-wider shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Run Another ATS Analysis</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AtsAnalyzer;
