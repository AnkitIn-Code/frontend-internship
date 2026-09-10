import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Brain,
  Code2,
  Users,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
  ChevronRight,
  X,
  Compass,
  Play,
  Award,
  Zap,
} from 'lucide-react';
import InterviewRoom from '../../components/interview/InterviewRoom';
import { startInterview } from '../../services/interviewApi';
import Skeleton from '../../components/ui/Skeleton';
import FinalReport from '../../components/interview/FinalReport';
import axios from '../../utils/axios';

const ROLE_LIST = {
  "Software / Tech": [
    "Java Developer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
    "React Developer", "Node.js Developer", "Python Developer", "Software Engineer (Fresher)",
    "Web Developer", "Mobile App Developer", "Android Developer", "QA Tester",
    "Software Tester", "DevOps Intern", "Cloud Intern"
  ],
  "Data / AI": [
    "Data Analyst", "Data Science Intern", "Machine Learning Intern", "AI Intern",
    "Business Analyst", "Data Entry Analyst"
  ],
  "Design": [
    "UI UX Designer", "Graphic Designer", "Product Designer", "Motion Designer", "Video Editor"
  ],
  "Marketing": [
    "Digital Marketing Executive", "Social Media Manager", "SEO Executive", "Content Writer",
    "Copywriter", "Performance Marketing Intern"
  ],
  "Business / Non-Tech": [
    "HR Executive", "HR Intern", "Sales Executive", "Business Development Executive",
    "Operations Executive", "Customer Support Executive"
  ],
  "Trending": [
    "AI Prompt Engineer", "No-Code Developer", "Automation Specialist", "Chatbot Developer",
    "AI Content Creator"
  ]
};

const ALL_ROLES = Object.values(ROLE_LIST).flat();

/* ── Score colour helper for Dark and Light modes ── */
const scoreColor = (s) =>
  s >= 85 ? 'text-emerald-600 dark:text-emerald-400' :
  s >= 70 ? 'text-indigo-600 dark:text-indigo-400' :
  s >= 55 ? 'text-amber-600 dark:text-amber-400' :
  'text-rose-600 dark:text-rose-400';

const scoreBg = (s) =>
  s >= 85 ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50' :
  s >= 70 ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/50' :
  s >= 55 ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50' :
  'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/50';

/* ── Suggestion Modal ── */
const SuggestionModal = ({ isOpen, onClose, roleSuggestions, onSelect }) => {
  if (!isOpen) return null;
  const recommendations = (roleSuggestions && roleSuggestions.length > 0)
    ? roleSuggestions.map(r => ({ role: r, icon: Compass }))
    : [
      { role: 'Full Stack Engineer', icon: Code2 },
      { role: 'Backend Developer', icon: Brain },
      { role: 'Frontend React Developer', icon: Sparkles },
      { role: 'Data Scientist', icon: Zap },
    ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-6 text-center border-b border-slate-100 dark:border-slate-800 relative bg-slate-50/50 dark:bg-slate-800/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Bot className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Select a Standard Job Role</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs">The AI customizes mock interview questions according to your selected role.</p>
        </div>

        <div className="p-4 space-y-2 overflow-y-auto max-h-[300px]">
          {recommendations.map(({ role, icon: IconComponent }) => (
            <button
              key={role}
              onClick={() => onSelect(role)}
              className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-100 dark:border-slate-800 transition-colors text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{role}</div>
                <div className="text-[10px] text-slate-400">AI Optimized Standard Role</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
            </button>
          ))}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
          >
            I will search from the list
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Recent Reports Panel ── */
const RecentReports = ({ reports, loading, onViewReport }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center space-y-2">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-1">
          <Bot className="w-5 h-5" />
        </div>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No mock interviews yet</p>
        <p className="text-xs text-slate-400">Complete your first session on the left to see detailed evaluations here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {reports.map((r, i) => {
        const score = r.report?.overallScore ?? 0;
        const date = new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        const IconComponent = r.interviewType === 'technical' ? Code2 : r.interviewType === 'hr' ? Users : Brain;

        return (
          <div
            key={r._id || i}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all p-3.5 sm:p-4 flex items-center gap-3 group cursor-pointer shadow-xs"
            onClick={() => onViewReport(r)}
          >
            {/* Type icon */}
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <IconComponent className="w-5 h-5" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                {r.jobRole}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 capitalize">
                {r.interviewType} · {r.difficulty} · {date}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                <span>{r.answeredQuestions ?? 0}/{r.totalQuestions ?? 0} questions answered</span>
              </p>
            </div>

            {/* Score pill */}
            <div className={`shrink-0 w-12 h-12 rounded-xl border flex flex-col items-center justify-center ${scoreBg(score)}`}>
              <span className={`text-base font-extrabold leading-none ${scoreColor(score)}`}>{score}</span>
              <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5">score</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ══════════════════════════════════════════════════════ */
const InterviewPage = () => {
  const navigate = useNavigate();
  const [loading] = useState(false);
  const [jobRole, setJobRole] = useState('');
  const [interviewType, setInterviewType] = useState('behavioral');
  const [resume, setResume] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [finalReport, setFinalReport] = useState(null);
  const [suggestionData, setSuggestionData] = useState({ open: false, roles: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');

  /* Past reports */
  const [pastReports, setPastReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [viewingReport, setViewingReport] = useState(null);

  useEffect(() => {
    document.title = 'AI Mock Interview – InterGuide';
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get('/interview/reports');
        setPastReports(res.data?.data?.reports || []);
      } catch (e) {
        console.error('Failed to load past reports', e);
      } finally {
        setReportsLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleStart = async (e) => {
    if (e) e.preventDefault();
    const isValid = ALL_ROLES.includes(searchQuery);
    if (!isValid) return;

    setIsStarting(true);
    try {
      const formData = new FormData();
      formData.append('job_role', searchQuery.trim());
      formData.append('interview_type', interviewType);
      formData.append('difficulty', difficulty);
      if (resume) formData.append('resume', resume);
      const response = await startInterview(formData);
      const { role_clear, questions, suggestions } = response.data || {};
      if (role_clear === false) {
        setSuggestionData({ open: true, roles: suggestions || [] });
        return;
      }
      setQuestions(questions || []);
    } catch (error) {
      console.error('Interview start error:', error);
      alert(`Interview service error: ${error.response?.data?.message || error.message || 'Failed to start interview.'}`);
    } finally {
      setIsStarting(false);
    }
  };

  const handleSelectSuggestion = (role) => {
    setJobRole(role);
    setSearchQuery(role);
    setSuggestionData({ open: false, roles: [] });
  };

  /* ── Loading skeleton ── */
  if (loading || (isStarting && questions.length === 0)) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full space-y-6">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Preparing Your AI Interview</h2>
            <p className="text-xs text-slate-400 text-center">Synthesizing role-specific interview questions and evaluation criteria...</p>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Final Report (just finished interview) ── */
  if (finalReport) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        <button
          onClick={() => {
            setFinalReport(null);
            setQuestions([]);
            setJobRole('');
            axios.get('/interview/reports').then(res => {
              setPastReports(res.data?.data?.reports || []);
            }).catch(() => {});
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>New Interview</span>
        </button>

        <FinalReport
          report={finalReport}
          jobRole={jobRole}
          onRestart={() => {
            setFinalReport(null);
            setQuestions([]);
            setJobRole('');
            axios.get('/interview/reports').then(res => {
              setPastReports(res.data?.data?.reports || []);
            }).catch(() => {});
          }}
        />
      </main>
    );
  }

  /* ── Viewing a past report ── */
  if (viewingReport) {
    const rawReport = { ...(viewingReport.report?.rawReport || viewingReport.report || {}) };

    if (!rawReport.overall_score && viewingReport.report?.overallScore)
      rawReport.overall_score = viewingReport.report.overallScore;

    if (!rawReport.answers || rawReport.answers.length === 0) {
      const qr = viewingReport.questionResults || [];
      if (qr.length > 0) {
        rawReport.answers = qr.map(q => ({
          question: q.questionText || '',
          transcript: q.userAnswer || '',
          skipped: !q.userAnswer,
          evaluation: q.evaluation ? {
            answer_score: q.evaluation.score || 0,
            communication_score: q.evaluation.score || 0,
            feedback: q.evaluation.feedback || '',
            strengths: Array.isArray(q.evaluation.strengths) ? q.evaluation.strengths : [],
            weaknesses: Array.isArray(q.evaluation.improvements) ? q.evaluation.improvements :
              Array.isArray(q.evaluation.weaknesses) ? q.evaluation.weaknesses : [],
            suggestions: [],
            technical_pointers: [],
          } : null,
          ideal_answer: q.evaluation?.model_answer || q.evaluation?.ideal_answer || '',
        }));
      }
    }

    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        <button
          onClick={() => setViewingReport(null)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to AI Interview</span>
        </button>

        <FinalReport
          report={rawReport}
          jobRole={viewingReport.jobRole}
          readonly={true}
        />
      </main>
    );
  }

  /* ── Active Interview Room ── */
  if (questions.length > 0) {
    return (
      <div className="w-full flex flex-col">
        <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to exit the interview? Your progress will be lost.')) {
                setQuestions([]);
                setJobRole('');
                navigate('/main-dashboard');
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 text-xs font-semibold transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Exit Interview</span>
          </button>
        </div>

        <InterviewRoom
          questions={questions}
          jobRole={jobRole}
          onComplete={(report) => setFinalReport(report)}
        />
      </div>
    );
  }

  /* ── Main Setup Screen (Matching platform design) ── */
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            AI Mock Interview
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Practice real-time speech interviews with an AI recruiter and receive instant feedback
          </p>
        </div>

        <button
          onClick={() => navigate('/main-dashboard')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT: Setup Form Card (7 cols) ── */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Configure Your Session</h2>
              <p className="text-[11px] text-slate-400">Select your target role, interview format, and difficulty</p>
            </div>
          </div>

          <form onSubmit={handleStart} className="space-y-4">
            {/* Target Role Input with Dropdown */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Job Role <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search from 40+ roles (e.g. Frontend Developer, Data Analyst)..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setIsDropdownOpen(true); }}
                  onFocus={() => setIsDropdownOpen(true)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !ALL_ROLES.includes(searchQuery)) e.preventDefault(); }}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm font-medium transition-all outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 ${
                    ALL_ROLES.includes(searchQuery)
                      ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                  }`}
                />
                {ALL_ROLES.includes(searchQuery) && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                  <div className="absolute z-20 left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[260px] overflow-y-auto">
                    {Object.entries(ROLE_LIST).map(([category, roles]) => {
                      const filtered = roles.filter(r => r.toLowerCase().includes(searchQuery.toLowerCase()));
                      if (filtered.length === 0) return null;
                      return (
                        <div key={category} className="p-2 border-b border-slate-50 dark:border-slate-800/60 last:border-0">
                          <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{category}</div>
                          {filtered.map(role => (
                            <button
                              key={role}
                              type="button"
                              onClick={() => { setSearchQuery(role); setJobRole(role); setIsDropdownOpen(false); }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                                searchQuery === role
                                  ? 'bg-indigo-600 text-white'
                                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              <span>{role}</span>
                              {searchQuery === role && <Check className="w-3.5 h-3.5" />}
                            </button>
                          ))}
                        </div>
                      );
                    })}
                    {ALL_ROLES.filter(r => r.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No matching standard roles found
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Interview Type Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Interview Format
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { value: 'behavioral', label: 'Behavioral', desc: 'Situations & soft skills', icon: Brain },
                  { value: 'technical', label: 'Technical', desc: 'Coding & core concepts', icon: Code2 },
                  { value: 'hr', label: 'HR / Culture', desc: 'Culture & fit questions', icon: Users },
                ].map(({ value, label, desc, icon: IconComp }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setInterviewType(value)}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      interviewType === value
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <IconComp className={`w-4 h-4 mb-1.5 ${interviewType === value ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                    <span className="font-bold text-xs">{label}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Interview Difficulty Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { value: 'easy', label: 'Easy', desc: 'Entry-level basics', icon: Check },
                  { value: 'medium', label: 'Medium', desc: 'Intermediate scenarios', icon: Zap },
                  { value: 'difficult', label: 'Difficult', desc: 'Advanced in-depth', icon: Award },
                ].map(({ value, label, desc, icon: IconComp }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDifficulty(value)}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      difficulty === value
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <IconComp className={`w-4 h-4 mb-1.5 ${difficulty === value ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                    <span className="font-bold text-xs">{label}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Resume Upload (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Resume Context <span className="text-slate-400 font-normal">(Optional PDF)</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setResume(e.target.files[0] || null)}
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-600 dark:text-slate-300 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-950/60 file:text-indigo-600 dark:file:text-indigo-400 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">If attached, the AI personalizes questions using your projects and skills.</p>
            </div>

            {/* Start Button */}
            <button
              type="submit"
              disabled={isStarting || !ALL_ROLES.includes(searchQuery)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing Interview...</span>
                </>
              ) : searchQuery === '' ? (
                <span>Search for a role to begin</span>
              ) : !ALL_ROLES.includes(searchQuery) ? (
                <span>Select a standard role from list</span>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Interview</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── RIGHT: Recent Reports Panel (5 cols) ── */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent Interviews</h2>
                <p className="text-[11px] text-slate-400">Your completed mock session evaluations</p>
              </div>
            </div>

            {!reportsLoading && pastReports.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                {pastReports.length} saved
              </span>
            )}
          </div>

          <RecentReports
            reports={pastReports}
            loading={reportsLoading}
            onViewReport={setViewingReport}
          />
        </div>
      </div>

      <SuggestionModal
        isOpen={suggestionData.open}
        onClose={() => setSuggestionData({ ...suggestionData, open: false })}
        roleSuggestions={suggestionData.roles}
        onSelect={handleSelectSuggestion}
      />
    </main>
  );
};

export default InterviewPage;
