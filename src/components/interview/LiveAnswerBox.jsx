import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';


const LiveAnswerBox = ({ isTimerRunning, micEnabled = true, timer, maxTimer, onSubmitAnswer, onEndInterview, layout = 'footer', onPermissionChange }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [typedText, setTypedText] = useState('');
    const [interimText, setInterimText] = useState('');
    const [audioLevels, setAudioLevels] = useState(Array(15).fill(2));
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);
    const audioBlobRef = useRef(null);
    const typedTextRef = useRef('');
    const interimTextRef = useRef('');
    const recognitionRef = useRef(null);
    const animationFrameRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [permissionError, setPermissionError] = useState(false);
    const isRecordingRef = useRef(false);
    const stoppedRef = useRef(false); // guards against async race conditions
    const hasErrorRef = useRef(false);
    useEffect(() => { typedTextRef.current = typedText; }, [typedText]);
    useEffect(() => { interimTextRef.current = interimText; }, [interimText]);

    const stopAll = () => {
        // Mark as stopped FIRST — prevents any in-flight async startRecording from proceeding
        stoppedRef.current = true;
        isRecordingRef.current = false;

        // Stop MediaRecorder
        try {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
        } catch (_) { }

        // Stop all stream tracks (releases the mic hardware)
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => { try { t.stop(); } catch (_) { } });
            streamRef.current = null;
        }

        // Cancel visualizer
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        // Close audio context
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(() => {});
            audioContextRef.current = null;
        }

        // Abort speech recognition (abort is immediate, stop allows onend to fire)
        try { recognitionRef.current?.abort(); } catch (_) { }

        setAudioLevels(Array(15).fill(4));
        setIsRecording(false);
    };

    const startRecording = async () => {
        // Reset the stop guard — we're intentionally starting
        stoppedRef.current = false;
        hasErrorRef.current = false;
        setTypedText('');
        setInterimText('');
        setPermissionError(false);
        audioChunksRef.current = [];
        audioBlobRef.current = null;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // CRITICAL: Check if stopAll was called while we were awaiting getUserMedia
            if (stoppedRef.current) {
                stream.getTracks().forEach(t => t.stop());
                return;
            }

            streamRef.current = stream;
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') {
                await audioCtx.resume();
            }
            const analyser = audioCtx.createAnalyser();
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 64;
            audioContextRef.current = audioCtx;
            analyserRef.current = analyser;
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            let lastUpdateTime = 0;
            const updateLevels = (timestamp) => {
                if (stoppedRef.current) return; // bail if stopped
                if (timestamp - lastUpdateTime < 60) {
                    animationFrameRef.current = requestAnimationFrame(updateLevels);
                    return;
                }
                lastUpdateTime = timestamp;

                analyser.getByteFrequencyData(dataArray);
                const levels = Array.from({ length: 15 }, (_, i) => {
                    const val = dataArray[i * 2] || 0;
                    return Math.max(4, (val / 255) * 48);
                });

                setAudioLevels(prev => {
                    const changed = levels.some((v, i) => Math.abs(v - prev[i]) > 2);
                    return changed ? levels : prev;
                });
                animationFrameRef.current = requestAnimationFrame(updateLevels);
            };
            animationFrameRef.current = requestAnimationFrame(updateLevels);
            const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
            mr.onstop = () => { audioBlobRef.current = new Blob(audioChunksRef.current, { type: 'audio/webm' }); };
            mr.start(250);
            mediaRecorderRef.current = mr;
            isRecordingRef.current = true;
            setIsRecording(true);
            try { recognitionRef.current?.start(); } catch { }
        } catch (err) {
            console.error('Mic Access Failed:', err);
            isRecordingRef.current = false;
            setIsRecording(false);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message?.includes('denied')) {
                setPermissionError(true);
                if (onPermissionChange) onPermissionChange(true);
            }
        }
    };

    const handleRetryPermission = () => {
        setPermissionError(false);
        if (onPermissionChange) onPermissionChange(false);
        startRecording();
    };

    const handleDismissPermission = () => {
        setPermissionError(false);
        if (onPermissionChange) onPermissionChange(false);
    };
    const handleSubmit = () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        // Kill everything immediately
        stopAll();

        // Give MediaRecorder a moment to finalize the onstop and blob creation
        const checkBlob = (attempts) => {
            const finalTranscript = (typedTextRef.current + interimTextRef.current).trim();

            if (audioBlobRef.current || attempts <= 0) {
                onSubmitAnswer(finalTranscript, audioBlobRef.current);
            } else {
                setTimeout(() => checkBlob(attempts - 1), 60);
            }
        };

        checkBlob(15);
    };

    // Derive whether we should be recording from props
    // Include !isSubmitting to prevent mic restart after handleSubmit→stopAll
    // but before the parent sets isEvaluating (which makes isTimerRunning false)
    const shouldRecord = isTimerRunning && micEnabled && !isSubmitting;

    useEffect(() => {
        if (shouldRecord && !isRecordingRef.current) {
            startRecording();
        } else if (!shouldRecord) {
            // Always enforce mic-off when shouldRecord is false,
            // even if isRecordingRef is already false (handles edge cases
            // where refs were cleared but streams/recognition survived)
            stopAll();
        }
    }, [shouldRecord]);

    // Cleanup on unmount — ensures mic is released no matter what
    useEffect(() => {
        return () => {
            stoppedRef.current = true;
            isRecordingRef.current = false;
            try {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                    mediaRecorderRef.current.stop();
                }
            } catch (_) { }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => { try { t.stop(); } catch (_) { } });
                streamRef.current = null;
            }
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(() => {});
                audioContextRef.current = null;
            }
            try { recognitionRef.current?.abort(); } catch (_) { }
        };
    }, []);

    useEffect(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return;
        const r = new SR();
        r.continuous = true; r.interimResults = true; r.lang = 'en-US';
        r.onresult = (e) => {
            let final = '';
            let interim = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
                if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';
                else interim += e.results[i][0].transcript;
            }
            if (final) setTypedText(prev => (prev + final).trimStart());
            setInterimText(interim);
        };
        r.onstart = () => {
            hasErrorRef.current = false;
        };
        r.onerror = (e) => {
            // console.error('STT Error:', e.error); // Removed console.error
            if (e.error === 'not-allowed' || e.error === 'service-not-allowed' || e.error === 'network') {
                hasErrorRef.current = true;
            }
        };
        r.onend = () => {
            if (isRecordingRef.current && !stoppedRef.current && !hasErrorRef.current) {
                try {
                    // Small delay to avoid rapid-fire restarts
                    setTimeout(() => {
                        if (isRecordingRef.current && !stoppedRef.current) {
                            recognitionRef.current?.start();
                        }
                    }, 500);
                } catch { }
            }
        };
        recognitionRef.current = r;
        return () => { try { r.abort(); } catch { } };
    }, []);
    useEffect(() => {
        const checkBrave = async () => {
            if (navigator.brave && await navigator.brave.isBrave()) {
            }
        };
        checkBrave();
    }, []);
    // isRecordingRef is now managed directly in startRecording() and stopAll()
    const hasShownToastRef = useRef(false);

    useEffect(() => {
        if (timer === 0 && !isTimerRunning && !permissionError) {
            if (!hasShownToastRef.current) {
                hasShownToastRef.current = true;
            }
            const id = setTimeout(handleSubmit, 1000);
            return () => clearTimeout(id);
        } else if (timer > 0) {
            hasShownToastRef.current = false;
        }
    }, [timer, isTimerRunning, handleSubmit, permissionError]);

    const timerPct = maxTimer ? (timer / maxTimer) * 100 : 100;

    return (
        <div className="flex flex-col gap-2 md:gap-4 max-w-2xl mx-auto w-full px-1 sm:px-2">
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-x-hidden transition-all duration-300">

                <div className="flex flex-col items-center gap-3 sm:gap-4 relative z-10">
                    <div className="w-full flex flex-col items-center gap-2 sm:gap-3">
                        <div className="h-10 sm:h-12 flex items-center justify-center gap-1 px-4">
                            {audioLevels.map((h, i) => (
                                <motion.div
                                    key={i}
                                    style={{ height: `${h}px` }}
                                    className="w-1 sm:w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 opacity-80"
                                    animate={{ height: isRecording ? Math.max(3, h) : 3 }}
                                />
                            ))}
                        </div>

                        <AnimatePresence>
                            {(isRecording && (typedText || interimText)) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="w-full px-2 sm:px-4 text-center pointer-events-none"
                                >
                                    <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto line-clamp-2 italic">
                                        {typedText}
                                        <span className="text-indigo-500 dark:text-indigo-400 opacity-70 ml-1">{interimText}</span>
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/90 px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/60">
                                <div className="relative flex items-center justify-center w-2 h-2">
                                    <div className={`w-full h-full rounded-full transition-all duration-300 ${isRecording ? 'bg-rose-500' : !shouldRecord && isTimerRunning ? 'bg-amber-400' : 'bg-slate-400 dark:bg-slate-500'}`} />
                                    {isRecording && (
                                        <div className="absolute inset-0 w-full h-full rounded-full bg-rose-500 animate-ping opacity-40" />
                                    )}
                                </div>
                                <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${isRecording ? 'text-slate-900 dark:text-white' : !shouldRecord && isTimerRunning ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {isRecording ? 'Live Recording' : !shouldRecord && isTimerRunning ? 'Mic Paused' : 'Mic Off'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {isTimerRunning && (
                        <div className="w-full max-w-sm px-2">
                            <div className="flex items-center justify-between mb-1 px-0.5">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Answer Window</span>
                                <span className={`text-xs font-mono font-bold tabular-nums ${timer <= 10 ? 'text-rose-500 animate-pulse' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                    {String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}
                                </span>
                            </div>
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                                <motion.div
                                    initial={{ width: '100%' }}
                                    animate={{ width: `${timerPct}%` }}
                                    className={`h-full rounded-full transition-colors duration-500 ${timer <= 10 ? 'bg-rose-500' : 'bg-indigo-600 dark:bg-indigo-500'}`}
                                />
                            </div>
                        </div>
                    )}

                    <div className={`flex items-center gap-2.5 w-full ${layout === 'sidebar' ? 'flex-col' : 'flex-row'}`}>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting || (!isRecording && !typedText.trim())}
                            className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-xs active:scale-[0.98] cursor-pointer ${isSubmitting || (!isRecording && !typedText.trim())
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-slate-700/60 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                }`}
                        >
                            <span>{isSubmitting ? 'Evaluating...' : 'Submit Answer'}</span>
                        </button>

                        {onEndInterview && (
                            <button
                                onClick={() => { stopAll(); onEndInterview?.(); }}
                                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors shadow-xs shrink-0 cursor-pointer"
                                title="End Session"
                                type="button"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                <span className="text-xs font-bold uppercase tracking-wider">End</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Permission Error Overlay */}
                <AnimatePresence>
                    {permissionError && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-[60] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center text-center p-6 border border-rose-200 dark:border-rose-800/80 shadow-xl"
                        >
                            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center mb-4 border border-rose-200 dark:border-rose-900/60">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1.5">Microphone Blocked</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-xs mb-6">
                                Please click the lock icon in your browser address bar, allow microphone access, and then click retry.
                            </p>
                            <div className="flex flex-col gap-2.5 w-full max-w-[220px]">
                                <button
                                    type="button"
                                    onClick={handleRetryPermission}
                                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-colors cursor-pointer"
                                >
                                    Retry Access
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDismissPermission}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold text-xs py-1 transition-colors cursor-pointer"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LiveAnswerBox;
