import React, { useEffect, useState, useCallback, useRef } from 'react';
import { speakText } from '../../services/interviewApi';
import PrepRing from './PrepRing';
const PREP_SECONDS = 5;
const PulseRings = () => (
    <>
        {[0.4, 0.7, 1.0, 1.3].map((delay, i) => (
            <div key={i} className="absolute inset-0 rounded-full border border-blue-400 opacity-0"
                style={{ animation: `ringP 3s ease-out ${delay}s infinite` }} />
        ))}
        <style>{`
            @keyframes ringP{
                0%{transform:scale(1);opacity:.4}
                100%{transform:scale(2.2);opacity:0}
            }
            @keyframes rotateRing{
                0%{transform:rotate(0deg)}
                100%{transform:rotate(360deg)}
            }
        `}</style>
    </>
);
const Waveform = ({ active }) => {
    const bars = [25, 45, 65, 35, 75, 40, 60, 45, 80, 50, 70, 40, 65, 30, 50];
    return (
        <div className="flex items-center justify-center gap-[3px] h-8 mt-4">
            {bars.map((v, i) => (
                <div key={i} className={`w-1 rounded-full ${active ? 'bg-blue-400' : 'bg-slate-200'}`}
                    style={{
                        height: `${active ? v : 15}%`,
                        opacity: active ? 1 : 0.6,
                        animation: active ? `pulseWave ${0.6 + (i % 4) * 0.2}s ease-in-out ${i * 0.08}s infinite alternate` : 'none',
                        boxShadow: active ? '0 0 12px rgba(59, 130, 246, 0.3)' : 'none'
                    }} />
            ))}
            <style>{`@keyframes pulseWave{from{transform:scaleY(.4); opacity:.5}to{transform:scaleY(1.2); opacity:1}}`}</style>
        </div>
    );
};
const QuestionBox = React.forwardRef(({ questionText, onTimerStart, onStateChange }, ref) => {
    const [uiPhase, setUiPhase] = useState('speaking');
    const [repeatCount, setRepeatCount] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [prepSeconds, setPrepSeconds] = useState(PREP_SECONDS);
    const [isBlurring, setIsBlurring] = useState(true);
    const [ttsReady, setTtsReady] = useState(false);
    const audioRef = useRef(null);
    const prepIntervalRef = useRef(null);
    const hasStartedRef = useRef(false);
    const speakControllerRef = useRef(null);

    useEffect(() => {
        if (onStateChange) {
            onStateChange({ uiPhase, prepSeconds, isSpeaking });
        }
    }, [uiPhase, prepSeconds, isSpeaking, onStateChange]);

    const stopAudio = useCallback(() => {
        if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; audioRef.current = null; }
        setIsSpeaking(false);
    }, []);
    const triggerStart = useCallback(() => {
        if (hasStartedRef.current) return;
        hasStartedRef.current = true;
        speakControllerRef.current?.abort();
        if (prepIntervalRef.current) clearInterval(prepIntervalRef.current);
        setUiPhase('done');
        onTimerStart();
    }, [onTimerStart]);
    const startPrepTimer = useCallback(() => {
        setPrepSeconds(PREP_SECONDS);
        setUiPhase('prep');
        if (prepIntervalRef.current) clearInterval(prepIntervalRef.current);
        prepIntervalRef.current = setInterval(() => {
            setPrepSeconds(p => {
                if (p <= 1) { clearInterval(prepIntervalRef.current); triggerStart(); return 0; }
                return p - 1;
            });
        }, 1000);
    }, [triggerStart]);

    React.useImperativeHandle(ref, () => ({
        triggerStart
    }));

    const speak = useCallback(async (text, signal) => {
        stopAudio(); setIsSpeaking(true);
        const tryPlay = async (v) => {
            const url = await speakText(text, v);
            if (signal?.aborted) { URL.revokeObjectURL(url); return; }
            const a = new Audio(url); audioRef.current = a;
            return new Promise((res, rej) => {
                const done = () => { URL.revokeObjectURL(url); res(); };
                a.onended = done; a.onerror = () => { URL.revokeObjectURL(url); rej(new Error('play error')); };
                a.onplay = () => {
                    // Audio actually started — reveal the question NOW
                    setTtsReady(true);
                    setIsBlurring(false);
                };
                const p = a.play(); if (p) p.catch(() => { URL.revokeObjectURL(url); rej(new Error('play blocked')); });
                signal?.addEventListener('abort', () => { a.pause(); done(); });
            });
        };
        try { await tryPlay('en-US-ChristopherNeural'); }
        catch {
            try { if (!signal?.aborted) await tryPlay('en-GB-LibbyNeural'); }
            catch {
                if (!signal?.aborted) {
                    // Fallback: reveal question immediately for browser synth
                    setTtsReady(true);
                    setIsBlurring(false);
                    await new Promise(res => {
                        if ('speechSynthesis' in window) {
                            window.speechSynthesis.cancel();
                            const u = new SpeechSynthesisUtterance(text); u.lang = 'en-GB';
                            u.onend = res; u.onerror = res; window.speechSynthesis.speak(u);
                            signal?.addEventListener('abort', () => { window.speechSynthesis.cancel(); res(); });
                        } else setTimeout(res, Math.max(3000, text.length * 55));
                    });
                }
            }
        }
        if (!signal?.aborted) { setIsSpeaking(false); startPrepTimer(); }
    }, [stopAudio, startPrepTimer]);
    useEffect(() => {
        if (!questionText) return;

        let isMounted = true;
        const ctrl = new AbortController();
        speakControllerRef.current = ctrl;
        hasStartedRef.current = false;

        setUiPhase('speaking');
        setRepeatCount(0);
        setPrepSeconds(PREP_SECONDS);
        setIsBlurring(true);
        setTtsReady(false);

        // Start TTS immediately — question stays hidden until audio.onplay fires
        if (isMounted && !ctrl.signal.aborted) {
            speak(questionText, ctrl.signal);
        }

        // Safety fallback: if TTS takes too long (>15s), reveal anyway
        const safetyTimer = setTimeout(() => {
            if (isMounted && !ctrl.signal.aborted) {
                setTtsReady(true);
                setIsBlurring(false);
            }
        }, 15000);

        return () => {
            isMounted = false;
            clearTimeout(safetyTimer);
            ctrl.abort();
            speakControllerRef.current = null;
            stopAudio();
            if (prepIntervalRef.current) clearInterval(prepIntervalRef.current);
        };
    }, [questionText, speak, stopAudio]);
    const handleRepeat = async () => {
        if (repeatCount >= 1 || hasStartedRef.current || isSpeaking) return;
        if (prepIntervalRef.current) clearInterval(prepIntervalRef.current);
        setRepeatCount(p => p + 1);
        setPrepSeconds(PREP_SECONDS);
        setUiPhase('speaking');
        const ctrl = new AbortController(); speakControllerRef.current = ctrl;
        await speak(questionText, ctrl.signal);
    };
    const statusLabel = isSpeaking ? 'AI Speaking' : uiPhase === 'prep' ? 'Pause' : uiPhase === 'done' ? 'Listening' : '';
    const statusColor = isSpeaking ? 'text-indigo-600 dark:text-indigo-400' : uiPhase === 'done' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500';
    return (
        <div className="relative w-full flex flex-col items-center">
            {isBlurring && (
                <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-500">
                    <div className="flex items-center gap-2.5 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full border border-slate-200 dark:border-slate-700 shadow-md">
                        <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest animate-pulse">System Scanning</span>
                    </div>
                </div>
            )}
            <div className={`flex flex-col items-center justify-center text-center w-full max-w-lg lg:max-w-4xl px-4 transition-all duration-700 ${isBlurring ? 'blur-2xl opacity-0 scale-105' : 'blur-0 opacity-100 scale-100'}`}>
                {/* AI Avatar Circle */}
                <div className="relative flex items-center justify-center w-16 h-16 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mb-3 lg:mb-5 shrink-0">
                    {isSpeaking && <PulseRings />}
                    <div className={`absolute inset-0 bg-indigo-500/15 dark:bg-indigo-500/25 rounded-full blur-2xl transition-all duration-700 ${isSpeaking ? 'scale-125 opacity-100' : 'scale-100 opacity-0'}`} />
                    <div className={`relative w-16 h-16 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-md transition-all duration-500 ${isSpeaking ? 'ring-4 ring-indigo-500/20' : ''}`}>
                        <div className="flex items-center justify-center h-full relative z-10">
                            <span className="text-indigo-600 dark:text-indigo-400 text-2xl sm:text-4xl lg:text-5xl font-black italic tracking-tighter select-none">AI</span>
                        </div>
                        <div className={`absolute top-0.5 right-0.5 sm:top-1.5 sm:right-1.5 w-3.5 h-3.5 sm:w-6 sm:h-6 rounded-full border-2 border-white dark:border-slate-800 shadow-sm ${uiPhase === 'done' ? 'bg-emerald-500' : isSpeaking ? 'bg-indigo-600 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`} />
                    </div>
                </div>

                {/* Status Indicator */}
                <div className="flex flex-col items-center gap-1 mb-2">
                    <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest ${statusColor} bg-slate-100 dark:bg-slate-800/90 px-3 py-1 rounded-full border border-slate-200/60 dark:border-slate-700/60`}>
                        {statusLabel}
                    </span>
                </div>
                <Waveform active={isSpeaking} />

                {/* Question Text Box */}
                <div className="mt-4 sm:mt-6 w-full max-w-2xl mx-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl px-6 sm:px-10 py-6 sm:py-8 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden text-center">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">
                                Interviewer Question
                            </span>
                            <p className="text-slate-900 dark:text-white text-base sm:text-lg lg:text-xl font-bold leading-relaxed tracking-tight">
                                {questionText}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mobile PrepRing or Listening Status */}
                {(uiPhase === 'speaking' || uiPhase === 'prep') ? (
                    <div className="mt-3 shrink-0 lg:hidden">
                        <PrepRing seconds={prepSeconds} total={PREP_SECONDS} frozen={uiPhase === 'speaking'} onStartNow={triggerStart} />
                    </div>
                ) : uiPhase === 'done' && (
                    <div className="mt-4 flex flex-col items-center gap-1.5 animate-in slide-in-from-bottom duration-500 shrink-0">
                        <div className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-full border border-emerald-200 dark:border-emerald-800/60 shadow-xs flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <p className="text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                                Listening to your response
                            </p>
                        </div>
                        <p className="text-slate-400 dark:text-slate-500 text-[10px] font-medium tracking-wide">
                            Speak clearly for accurate transcription and evaluation
                        </p>
                    </div>
                )}

                {/* Repeat Question Button */}
                {uiPhase === 'prep' && repeatCount < 1 && !isSpeaking && (
                    <button
                        type="button"
                        onClick={handleRepeat}
                        className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Repeat Question</span>
                    </button>
                )}
            </div>
        </div>
    );
});
export default QuestionBox;
