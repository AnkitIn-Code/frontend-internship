import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const AudioCheck = ({ onConfirm, setMicBlocked, type = 'interview' }) => {
    const [audioLevels, setAudioLevels] = useState(Array(15).fill(4));
    const [status, setStatus] = useState('ready'); // ready, listening, success, error
    const streamRef = useRef(null);
    const audioCtxRef = useRef(null);
    const analyserRef = useRef(null);
    const animationRef = useRef(null);

    const cleanupStream = () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
        if (audioCtxRef.current) {
            audioCtxRef.current.close().catch(() => {});
            audioCtxRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
    };

    const startCheck = async () => {
        try {
            setStatus('listening');
            if (navigator.permissions && navigator.permissions.query) {
                const status = await navigator.permissions.query({ name: 'microphone' });
                if (status.state === 'denied') {
                    throw new Error('Permission denied');
                }
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            if (ctx.state === 'suspended') {
                await ctx.resume();
            }
            const analyser = ctx.createAnalyser();
            const source = ctx.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 64;
            audioCtxRef.current = ctx;
            analyserRef.current = analyser;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const update = () => {
                analyser.getByteFrequencyData(dataArray);
                const levels = Array.from({ length: 15 }, (_, i) => {
                    const val = dataArray[i * 2] || 0;
                    if (val > 40) {
                        setStatus('success');
                        // Release mic immediately after detecting audio — no need to hold it
                        cleanupStream();
                    }
                    return Math.max(4, (val / 255) * 60);
                });
                setAudioLevels(levels);
                // Only continue animating if stream is still active
                if (streamRef.current) {
                    animationRef.current = requestAnimationFrame(update);
                }
            };
            animationRef.current = requestAnimationFrame(update);
        } catch (err) {
            console.error('Audio Check Failed:', err);
            setStatus('error');
            setMicBlocked(true);
        }
    };

    useEffect(() => {
        const checkPermission = async () => {
            try {
                if (navigator.permissions && navigator.permissions.query) {
                    const status = await navigator.permissions.query({ name: 'microphone' });
                    if (status.state === 'denied') {
                        setStatus('error');
                    }
                }
            } catch (e) {}
        };
        checkPermission();

        return () => cleanupStream();
    }, []);

    const messages = {
        interview: {
            ready: 'Let\'s ensure the AI interviewer can hear you clearly. We highly recommend testing your microphone now.',
            success: 'Vocal clarity verified. You are perfectly set to start your interview.'
        },
        placement: {
            ready: 'Please ensure you are in a quiet environment and your microphone is active for the assessment.',
            success: 'Audio levels optimized. Your spoken proficiency can now be analyzed accurately.'
        }
    }[type] || {
        ready: 'Let\'s verify your audio before we begin.',
        success: 'Audio check successful.'
    };

    return (
        <div className="flex-grow flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center max-w-lg w-full relative overflow-hidden group">
                <div className={`absolute top-0 left-0 w-full h-1 ${status === 'success' ? 'bg-emerald-500' : 'bg-indigo-600'}`} />

                <div className="mb-6 sm:mb-8 relative">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto border border-slate-200/80 dark:border-slate-700 relative z-10 transition-all duration-300">
                        {status === 'success' ? (
                            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/60">
                                    <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex items-center gap-[2px] sm:gap-1">
                                {audioLevels.map((h, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ height: h }}
                                        className={`w-1 sm:w-1.5 rounded-full ${status === 'listening' ? 'bg-indigo-500 dark:bg-indigo-400' : 'bg-slate-200 dark:bg-slate-700'}`}
                                        style={{ height: '4px' }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                    {status === 'success' ? 'Microphone Verified!' : 'Audio System Check'}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-6 sm:mb-8 leading-relaxed px-1 sm:px-4">
                    {status === 'success'
                        ? messages.success
                        : status === 'listening'
                            ? "Please say 'Hello AI' or 'Testing 1 2 3' clearly to verify."
                            : messages.ready
                    }
                </p>

                <div className="flex flex-col gap-3">
                    {status === 'ready' && (
                        <button
                            type="button"
                            onClick={startCheck}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors uppercase tracking-widest cursor-pointer"
                        >
                            Test Microphone
                        </button>
                    )}

                    {status === 'listening' && (
                        <div className="py-3 px-6 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest animate-pulse">
                            Listening for input...
                        </div>
                    )}

                    {status === 'success' && (
                        <button
                            type="button"
                            onClick={onConfirm}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors uppercase tracking-widest cursor-pointer"
                        >
                            Begin Interview
                        </button>
                    )}

                    {status === 'error' && (
                        <div className="space-y-4 pt-1">
                            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl p-4 text-left">
                                <div className="flex gap-3 items-start">
                                    <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center shrink-0">
                                        <svg className="w-4 h-4 text-rose-600 dark:text-rose-400" fill="currentColor" viewBox="0 0 24 24"><path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2V7a5 5 0 00-5-5zM7 7a3 3 0 016 0v2H7V7z" /></svg>
                                    </div>
                                    <div>
                                        <h4 className="text-rose-900 dark:text-rose-300 font-bold text-xs uppercase tracking-wider mb-1">Microphone Access Required</h4>
                                        <p className="text-rose-700 dark:text-rose-400 text-xs leading-relaxed">
                                            1. Click the lock/tune icon in the browser address bar.<br/>
                                            2. Allow access to your microphone.<br/>
                                            3. Refresh or click retry to continue.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={() => window.location.reload()}
                                    className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-xs hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Refresh Page
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStatus('ready')}
                                    className="text-slate-500 dark:text-slate-400 text-xs font-semibold hover:text-slate-700 dark:hover:text-slate-200 transition-colors py-1 cursor-pointer"
                                >
                                    Try again anyway
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AudioCheck;
