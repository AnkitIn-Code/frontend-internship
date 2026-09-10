import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuestionBox from './QuestionBox';
import LiveAnswerBox from './LiveAnswerBox';
import PrepRing from './PrepRing';
import AudioCheck from './AudioCheck';
import { evaluateAnswer, generateReport, prefetchTts } from '../../services/interviewApi';
const TIMER_BY_DIFFICULTY = { Easy: 45, easy: 45, Medium: 60, medium: 60, Hard: 90, hard: 90 };

const InterviewRoom = ({ questions, jobRole, onComplete }) => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [timer, setTimer] = useState(TIMER_BY_DIFFICULTY[questions[0]?.difficulty] || 60);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [answers, setAnswers] = useState([]);
    const [phase, setPhase] = useState('ready');
    const [lastAnalysis, setLastAnalysis] = useState(null);
    const [lastEvaluation, setLastEvaluation] = useState(null);
    const [systemError, setSystemError] = useState(null);
    const [micBlocked, setMicBlocked] = useState(false);
    const [prepState, setPrepState] = useState({ uiPhase: 'speaking', prepSeconds: 5, isSpeaking: false });
    const [micEnabled, setMicEnabled] = useState(false);
    const isSubmittingRef = useRef(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Pre-fetch TTS for the first question during the audio-check phase
    useEffect(() => {
        if (phase === 'audio-check' && questions[0]?.question) {
            prefetchTts(questions[0].question, 'en-US-ChristopherNeural');
        }
    }, [phase]);

    const questionBoxRef = useRef(null);
    const currentQuestion = questions[currentIdx];
    const isLastQuestion = currentIdx === questions.length - 1;
    useEffect(() => {
        if (!isTimerRunning || timer <= 0 || micBlocked) return;
        const id = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    setIsTimerRunning(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [isTimerRunning, timer]);
    const handleTimerStart = useCallback(() => {
        setMicEnabled(true);
        setIsTimerRunning(true);
    }, []);
    const handleAnswerSubmit = useCallback(async (transcript, blob) => {
        isSubmittingRef.current = true;
        setIsTimerRunning(false);
        setMicEnabled(false);
        setPhase('processing');
        setLastAnalysis(null);
        setLastEvaluation(null);

        let evaluation = null;
        let analysis = { transcript: transcript || '' };

        if (blob && blob.size > 0) {
            try {
                const fd = new FormData();
                fd.append('audio', blob, 'answer.webm');
                fd.append('question', currentQuestion.question);
                fd.append('job_role', jobRole || '');

                const result = await evaluateAnswer(fd);

                if (result.status === 'success') {
                    analysis = result.data.analysis;
                    evaluation = result.data.evaluation;
                    setLastAnalysis(analysis);
                    setLastEvaluation(evaluation);

                    const wWords = (analysis?.transcript || '').split(' ').filter(Boolean).length;
                    const bWords = (transcript || '').split(' ').filter(Boolean).length;
                    if (wWords < bWords) analysis.transcript = transcript;
                }
            } catch (err) {
                console.error('Answer evaluation failed:', err);
                analysis.failed = true;
            }
        } else {
            // No audio blob provided or empty blob
        }

        const newAnswer = {
            question: currentQuestion.question,
            answer: analysis?.transcript || transcript || '',
            transcript: analysis?.transcript || transcript || '',
            evaluation: evaluation || null,
            analysis: analysis || null,
            ideal_answer: currentQuestion.ideal_answer,
        };

        const updatedAnswers = [...answers, newAnswer];
        setAnswers(updatedAnswers);

        await new Promise(res => setTimeout(res, 800));
        if (!isLastQuestion) {
            const nextIdx = currentIdx + 1;
            setCurrentIdx(nextIdx);
            setTimer(TIMER_BY_DIFFICULTY[questions[nextIdx]?.difficulty] || 60);
            await new Promise(res => setTimeout(res, 100));
            setPhase('answering');
            isSubmittingRef.current = false;
        } else {
            setPhase('finishing');
            try {
                const result = await generateReport(updatedAnswers, jobRole);
                onComplete({ ...result.data, answers: updatedAnswers });
            } catch (err) {
                console.error('Final report generation failed:', err);
                setSystemError('We encountered a critical failure generating your final report.');
                isSubmittingRef.current = false;
            }
        }
    }, [currentIdx, phase, currentQuestion, jobRole, answers, questions, onComplete]);

    const handleEndInterview = useCallback(async () => {
        setIsTimerRunning(false);
        setPhase('finishing');
        const currentSkipped = { question: currentQuestion.question, answer: '', transcript: '', evaluation: null, skipped: true, ideal_answer: currentQuestion.ideal_answer };
        const remaining = questions.slice(currentIdx + 1).map(q => ({ question: q.question, answer: '', transcript: '', evaluation: null, skipped: true, ideal_answer: q.ideal_answer }));
        const allAnswers = [...answers, currentSkipped, ...remaining];
        try {
            const result = await generateReport(allAnswers, jobRole);
            onComplete({ ...result.data, answers: allAnswers });
        } catch (err) {
            console.error('Final report generation failed (end early):', err);
            setSystemError('We could not synthesize your report after ending the session. Technical logs have recorded the incident.');
        }
    }, [currentQuestion.question, questions, currentIdx, answers, jobRole, onComplete]);

    if (systemError) return (
        <div className="flex-grow flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-rose-200 dark:border-rose-900/50 text-center max-w-md w-full animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/60 rounded-2xl flex items-center justify-center mx-auto mb-6 text-rose-500 border border-rose-200 dark:border-rose-900/50">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Session Interrupted</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed">{systemError}</p>
                <div className="flex flex-col gap-2.5">
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors uppercase tracking-widest cursor-pointer"
                    >
                        Retry Connection
                    </button>
                    <button
                        type="button"
                        onClick={() => window.location.href = '/main-dashboard'}
                        className="w-full py-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-colors uppercase tracking-wider cursor-pointer"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );

    if (phase === 'audio-check') return <AudioCheck onConfirm={() => setPhase('answering')} setMicBlocked={setMicBlocked} type="interview" />;
    if (phase === 'ready') return (
        <div className="flex-grow flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center max-w-lg w-full relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600" />
                <div className="relative mb-8">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto border border-slate-200/80 dark:border-slate-700 relative z-10">
                        <span className="text-indigo-600 dark:text-indigo-400 text-3xl font-black italic tracking-tighter">AI</span>
                    </div>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 rounded-full text-indigo-600 dark:text-indigo-400 mb-4 border border-indigo-100 dark:border-indigo-800/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">AI-Powered Session</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Ready for your interview?</h2>
                <div className="space-y-1 mb-8 text-center">
                    <p className="text-slate-500 dark:text-slate-400 font-semibold uppercase text-[11px] tracking-wider">{questions.length} questions customized for</p>
                    <p className="text-indigo-600 dark:text-indigo-400 text-base sm:text-lg font-bold">{jobRole || 'General Assessment'}</p>
                </div>
                <button
                    type="button"
                    onClick={() => setPhase('audio-check')}
                    className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors uppercase tracking-widest cursor-pointer"
                >
                    Start Session
                </button>
            </div>
        </div>
    );
    if (phase === 'processing' || phase === 'finishing') return (
        <div className="flex-grow flex flex-col w-full min-h-full bg-background text-foreground items-center justify-center relative overflow-hidden p-4">
            <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center max-w-md w-full relative z-10 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600 animate-pulse" />
                <div className="relative mb-8 w-20 h-20 sm:w-24 sm:h-24 mx-auto">
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-[spin_3s_linear_infinite]" />
                    <div className="absolute inset-2 rounded-full border-2 border-t-indigo-600 dark:border-t-indigo-400 animate-[spin_1.5s_linear_infinite]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700">
                            <span className="text-indigo-600 dark:text-indigo-400 text-lg font-black italic">AI</span>
                        </div>
                    </div>
                </div>
                <div className="animate-in fade-in slide-in-from-bottom duration-500">
                    <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full mb-3 border border-slate-200/60 dark:border-slate-700/60">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                            System Processing
                        </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                        {phase === 'finishing' ? 'Generating Final Report' : isLastQuestion ? 'Final Analysis' : 'Interviewer Thinking'}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium leading-relaxed">
                        {phase === 'finishing'
                            ? 'Synthesizing technical accuracy, vocal modulation, and formulating actionable feedback.'
                            : 'Analyzing answer content, acoustic clarity, and formulating the next question.'}
                    </p>
                </div>
            </div>
        </div>
    );
    return (
        <div className="flex flex-col w-full min-h-full bg-background text-foreground font-sans relative overflow-hidden select-none touch-none">
            {/* Top Bar / Header */}
            <header className="shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between z-40 shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="flex w-9 h-9 bg-indigo-600 rounded-xl items-center justify-center text-white shadow-xs">
                        <span className="font-black text-xs italic">AI</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400">Live Session</span>
                        </div>
                        <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight">{jobRole || 'Assessment Session'}</h2>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end mr-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Question</span>
                        <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                            {currentIdx + 1}<span className="text-slate-400 font-normal mx-0.5">/</span>{questions.length}
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center relative shadow-xs border border-slate-200/80 dark:border-slate-700">
                        <svg className="w-10 h-10 absolute -rotate-90" viewBox="0 0 40 40">
                            <circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="2.5" />
                            <circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" className="text-indigo-600 dark:text-indigo-400" strokeWidth="2.5"
                                strokeDasharray={106.8} strokeDashoffset={106.8 - (106.8 * (currentIdx + 1)) / questions.length} strokeLinecap="round" />
                        </svg>
                        <span className="relative text-[9px] font-bold text-slate-700 dark:text-slate-200">{Math.round(((currentIdx + 1) / questions.length) * 100)}%</span>
                    </div>
                </div>
            </header>

            {/* Main Stage */}
            <main className="flex-grow flex flex-col items-center relative overflow-y-auto overflow-x-hidden z-10 px-3 sm:px-6 lg:px-8 py-4 lg:py-8 no-scrollbar">
                <div className={`w-full max-w-[1500px] flex flex-col lg:grid lg:grid-cols-[280px_1fr_300px] gap-6 items-start transition-all duration-700 ${(timer === 0 && phase === 'answering') ? 'blur-md pointer-events-none' : 'blur-0'}`}>

                    {/* Left Sidebar (Desktop) */}
                    <div className="hidden lg:flex flex-col gap-4 sticky top-4">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/60">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Question Level</span>
                                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">Difficulty Matrix</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3].map(i => {
                                    const active = (currentQuestion.difficulty === 'Easy' && i === 1) ||
                                        (currentQuestion.difficulty === 'Medium' && i <= 2) ||
                                        (currentQuestion.difficulty === 'Hard');
                                    let colorCls = 'bg-slate-200 dark:bg-slate-700';
                                    if (active) {
                                        if (currentQuestion.difficulty === 'Easy') colorCls = 'bg-emerald-500';
                                        else if (currentQuestion.difficulty === 'Medium') colorCls = 'bg-amber-500';
                                        else colorCls = 'bg-rose-500';
                                    }
                                    return <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${colorCls}`} />;
                                })}
                                <span className={`ml-2 text-xs font-bold uppercase tracking-wider ${currentQuestion.difficulty === 'Easy' ? 'text-emerald-600 dark:text-emerald-400' : currentQuestion.difficulty === 'Medium' ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                    {currentQuestion.difficulty}
                                </span>
                            </div>
                        </div>

                        <LiveAnswerBox
                            key={currentIdx + "-desktop"}
                            isTimerRunning={isTimerRunning}
                            micEnabled={micEnabled}
                            timer={timer}
                            maxTimer={TIMER_BY_DIFFICULTY[currentQuestion.difficulty] || 60}
                            onSubmitAnswer={handleAnswerSubmit}
                            onEndInterview={handleEndInterview}
                            layout="sidebar"
                            onPermissionChange={setMicBlocked}
                        />
                    </div>

                    {/* Center Content */}
                    <div className="flex-grow flex flex-col items-center gap-6 w-full max-w-3xl mx-auto">
                        <div className="w-full animate-in fade-in zoom-in duration-700">
                            <QuestionBox
                                ref={questionBoxRef}
                                questionText={currentQuestion.question}
                                onTimerStart={handleTimerStart}
                                onStateChange={setPrepState}
                            />
                        </div>
                        <div className="lg:hidden h-28 w-full" />
                    </div>

                    {/* Right Sidebar (Desktop) */}
                    <div className="hidden lg:flex flex-col gap-4 sticky top-4">
                        {lastAnalysis ? (
                            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs w-full animate-in slide-in-from-right duration-500">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Acoustic Insights</span>
                                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">Previous Answer Metrics</h3>
                                    </div>
                                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/60">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pace Stability</span>
                                        <span className={`text-[10px] font-bold ${(lastAnalysis.pace_stability || 0) < 0.6 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'} uppercase`}>
                                            {(lastAnalysis.pace_stability || 0) < 0.6 ? 'Steady' : 'Variable'}
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${Math.max(20, 100 - (lastAnalysis.pace_stability || 0) * 100)}%` }} />
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Modulation</span>
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{Math.round((lastAnalysis.energy_variance || 0) * 1000)} <span className="text-[9px] text-slate-400 uppercase">MDL</span></span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-violet-600 dark:bg-violet-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (lastAnalysis.energy_variance || 0) * 4000)}%` }} />
                                    </div>
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-semibold text-slate-400">Fillers</span>
                                            <span className={`text-xs font-bold ${lastAnalysis.filler_count > 2 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>{lastAnalysis.filler_count || 0}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-semibold text-slate-400">Silence</span>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{Math.round((lastAnalysis.pause_ratio || 0) * 100)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 text-center flex flex-col items-center justify-center">
                                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 mb-2 border border-slate-200/60 dark:border-slate-700">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                </div>
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Metrics will appear after question 1</span>
                            </div>
                        )}

                        {(prepState.uiPhase === 'speaking' || prepState.uiPhase === 'prep') && (
                            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                                <PrepRing
                                    seconds={prepState.prepSeconds}
                                    total={5}
                                    frozen={prepState.uiPhase === 'speaking'}
                                    onStartNow={() => questionBoxRef.current?.triggerStart()}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Floating Footer */}
                <footer className="fixed bottom-0 inset-x-0 p-3 z-40 lg:hidden flex justify-center no-scrollbar">
                    <div className="w-full max-w-md mx-auto">
                        <LiveAnswerBox
                            key={currentIdx + "-mobile"}
                            isTimerRunning={isTimerRunning}
                            micEnabled={micEnabled}
                            timer={timer}
                            maxTimer={TIMER_BY_DIFFICULTY[currentQuestion.difficulty] || 60}
                            onSubmitAnswer={handleAnswerSubmit}
                            onEndInterview={handleEndInterview}
                            layout="footer"
                            onPermissionChange={setMicBlocked}
                        />
                    </div>
                </footer>
            </main>

            {/* Time's Up Modal */}
            {timer === 0 && phase === 'answering' && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 text-center flex flex-col items-center max-w-xs w-full">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 border border-indigo-100 dark:border-indigo-800/60">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">Time Expired</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Submitting and evaluating your spoken response...</p>
                        <div className="flex gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default InterviewRoom;
