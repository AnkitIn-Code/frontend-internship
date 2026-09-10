import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Home,
  RotateCcw,
  Printer,
  MessageSquare,
  Mic,
  Lightbulb,
  Brain,
  Check,
  ChevronRight
} from 'lucide-react';

const ScoreRing = ({ score, label, color }) => {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const fill = circ - (circ * Math.min(100, Math.max(0, score))) / 100;
  return (
    <div className="flex flex-col items-center gap-1.5 sm:gap-2">
      <div className="relative w-16 h-16 sm:w-22 sm:h-22">
        <svg className="w-16 h-16 sm:w-22 sm:h-22 -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={r} fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="8" />
          <circle
            cx="44" cy="44" r={r} fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={circ}
            strokeDashoffset={fill}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base sm:text-xl font-bold" style={{ color }}>{score}</span>
        </div>
      </div>
      <span className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 text-center">{label}</span>
    </div>
  );
};

const FinalReport = ({ report, jobRole, onRestart, readonly = false }) => {
  const navigate = useNavigate();
  const { overall_score = 0, confidence_score = 0, fluency_score = 0, technical_accuracy = 0, suggestions = [] } = report;

  const grade = overall_score >= 85
    ? { label: 'Excellent', icon: Award, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/70 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800/60' }
    : overall_score >= 70
      ? { label: 'Good', icon: CheckCircle2, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50/70 dark:bg-indigo-950/30', border: 'border-indigo-200 dark:border-indigo-800/60' }
      : overall_score >= 55
        ? { label: 'Fair', icon: TrendingUp, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50/70 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800/60' }
        : { label: 'Needs Work', icon: AlertCircle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50/70 dark:bg-rose-950/30', border: 'border-rose-200 dark:border-rose-800/60' };

  const GradeIcon = grade.icon;

  return (
    <div className="w-full bg-background text-foreground flex flex-col items-center justify-start py-2 sm:py-6">
      <div className="w-full max-w-4xl space-y-4 sm:space-y-6 pb-16 sm:pb-0">

        {/* Hero Performance Card */}
        <div className={`${grade.bg} border ${grade.border} rounded-2xl p-6 sm:p-8 text-center shadow-xs relative overflow-hidden`}>
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border ${grade.border} flex items-center justify-center mb-3 shadow-xs`}>
              <GradeIcon className={`w-7 h-7 ${grade.color}`} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">Interview Assessment Complete</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-4">
              {jobRole ? `Evaluation report for ${jobRole}` : 'Overall candidate performance breakdown'}
            </p>
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-sm ${grade.color} border ${grade.border} bg-white/90 dark:bg-slate-900/90 shadow-xs`}>
              <span>{grade.label}</span>
              <span className="opacity-40">•</span>
              <span>{overall_score}/100 Overall Score</span>
            </div>
          </div>
        </div>

        {/* Score Breakdown Ring Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">Score Breakdown</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 justify-items-center">
            <ScoreRing score={overall_score} label="Overall" color="#4f46e5" />
            <ScoreRing score={confidence_score} label="Confidence" color="#10b981" />
            <ScoreRing score={fluency_score} label="Fluency" color="#8b5cf6" />
            <ScoreRing score={technical_accuracy} label="Technical" color="#f59e0b" />
          </div>
        </div>

        {/* Detailed Metrics & Vocal Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-xs">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detailed Scoring</h2>
            {[
              { label: 'Overall Score', value: overall_score, color: 'bg-indigo-600' },
              { label: 'Confidence & Delivery', value: confidence_score, color: 'bg-emerald-500' },
              { label: 'Speech Fluency', value: fluency_score, color: 'bg-purple-500' },
              { label: 'Technical Accuracy', value: technical_accuracy, color: 'bg-amber-500' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>{label}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{value}/100</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${color}`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Mic className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vocal & Acoustic Analytics</h2>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Filler Words</span>
                  <span className={`text-sm font-bold ${(report.audio_metrics?.total_filler_words || 0) > 5 ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                    {report.audio_metrics?.total_filler_words || 0} count
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Modulation</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {Math.round((report.audio_metrics?.avg_modulation || 0) * 1000)} MDL
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Pause Ratio</span>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                    {Math.round((report.audio_metrics?.avg_pause_ratio || 0) * 100)}%
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Long Silences</span>
                  <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                    {report.audio_metrics?.total_long_pauses || 0}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Speaking Pace</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {report.audio_metrics?.avg_speech_rate || 0} WPM
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Acoustics analyzed via Web Audio API</p>
            </div>
          </div>
        </div>

        {/* Spoken English & Answer Evaluation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {report.spoken_english && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-xs font-bold text-slate-900 dark:text-white">Spoken English</h2>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                  {report.spoken_english.score}/100
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">{report.spoken_english.feedback}</p>
              <div className="space-y-2 pt-1">
                {report.spoken_english.strengths?.length > 0 && (
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Strengths</h3>
                    <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                      {report.spoken_english.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {report.spoken_english.weaknesses?.length > 0 && (
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1">Areas to Improve</h3>
                    <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                      {report.spoken_english.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {report.answer_evaluation && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-xs font-bold text-slate-900 dark:text-white">Technical Content</h2>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-xs font-bold">
                  {report.answer_evaluation.score}/100
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">{report.answer_evaluation.feedback}</p>
              <div className="space-y-2 pt-1">
                {report.answer_evaluation.strengths?.length > 0 && (
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Content Highlights</h3>
                    <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                      {report.answer_evaluation.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {report.answer_evaluation.weaknesses?.length > 0 && (
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1">Knowledge Gaps</h3>
                    <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                      {report.answer_evaluation.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Overall Suggestions */}
        {suggestions.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xs font-bold text-slate-900 dark:text-white">Actionable Next Steps</h2>
            </div>
            <ul className="space-y-3">
              {suggestions.map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-[10px] font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Transcript Section */}
        {report.answers && report.answers.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Question-by-Question Transcript</h2>
            <div className="space-y-6">
              {report.answers.map((ans, idx) => (
                <div key={idx} className="border-b border-slate-100 dark:border-slate-800/80 last:border-0 pb-6 last:pb-0">
                  <div className="flex items-start gap-2.5 mb-2.5">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      Q{idx + 1}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {ans.question}
                    </h3>
                  </div>

                  <div className="pl-8 space-y-3">
                    {/* User Answer */}
                    <div className={`p-3 rounded-xl border text-xs sm:text-sm leading-relaxed ${ans.skipped
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 italic'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        {ans.skipped ? 'Skipped Question' : 'Your Spoken Response'}
                      </div>
                      {ans.skipped ? 'You did not answer this question.' : (ans.transcript || ans.answer || 'No speech recorded.')}
                    </div>

                    {/* AI Approved Answer */}
                    {(ans.ideal_answer || (ans.evaluation && ans.evaluation.model_answer)) && (
                      <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/25 rounded-xl border border-emerald-200/60 dark:border-emerald-800/50">
                        <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          <Sparkles className="w-3 h-3" />
                          <span>AI Recommended Answer</span>
                        </div>
                        <p className="text-xs sm:text-sm text-emerald-950 dark:text-emerald-200 leading-relaxed">
                          {ans.ideal_answer || ans.evaluation.model_answer}
                        </p>
                      </div>
                    )}

                    {/* Question Feedback Badges */}
                    {!ans.skipped && ans.evaluation && (
                      <div className="space-y-2 pt-1">
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60">
                            Answer: {ans.evaluation.answer_score ?? ans.evaluation.answerScore ?? ans.evaluation.content_score ?? 0}/100
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/60">
                            Delivery: {ans.evaluation.communication_score ?? ans.evaluation.communicationScore ?? ans.evaluation.delivery_score ?? 0}/100
                          </span>
                        </div>

                        {ans.evaluation.technical_pointers && ans.evaluation.technical_pointers.length > 0 && (
                          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
                            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Key Technical Points</span>
                            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-0.5">
                              {(Array.isArray(ans.evaluation.technical_pointers) ? ans.evaluation.technical_pointers : [ans.evaluation.technical_pointers]).map((ptr, pIdx) => (
                                <li key={pIdx}>{ptr}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!readonly && (
          <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-8 print:hidden">
            <button
              type="button"
              onClick={() => navigate('/main-dashboard')}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            {onRestart && (
              <button
                type="button"
                onClick={onRestart}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>New Session</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinalReport;
