import React from 'react';

const PrepRing = ({ seconds, total, frozen, onStartNow }) => {
    const r = 32, circ = 2 * Math.PI * r;
    const offset = frozen ? 0 : circ - (circ * seconds) / total;
    const urgent = !frozen && seconds <= 2;
    return (
        <div className="flex flex-col items-center gap-2.5 mt-2 animate-in fade-in zoom-in duration-500">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16">
                <svg className="w-14 h-14 sm:w-16 sm:h-16 -rotate-90" viewBox="0 0 72 72">
                    <circle cx="36" cy="36" r={r} fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="5" />
                    <circle cx="36" cy="36" r={r} fill="none"
                        stroke={urgent ? '#ef4444' : '#4f46e5'} strokeWidth="5"
                        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-base sm:text-lg font-bold tabular-nums tracking-tight ${urgent ? 'text-rose-500 animate-pulse' : 'text-indigo-600 dark:text-indigo-400'}`}>
                        {seconds}
                    </span>
                    <span className="text-[7px] sm:text-[8px] font-semibold text-slate-400 uppercase tracking-wider -mt-0.5">Sec</span>
                </div>
            </div>
            <div className="text-center px-4">
                <p className="font-semibold text-slate-700 dark:text-slate-300 text-xs">{frozen ? 'AI Speaking…' : 'Preparing Answer…'}</p>
            </div>
            <button
                type="button"
                onClick={onStartNow}
                className="inline-flex items-center justify-center px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
                {frozen ? 'Speak Now' : 'Begin'}
            </button>
        </div>
    );
};

export default PrepRing;

