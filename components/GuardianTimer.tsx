import React, { useState, useEffect } from 'react';
import { Shield, Clock, AlertTriangle, CheckCircle, RefreshCcw } from 'lucide-react';

interface GuardianTimerProps {
    initialMinutes?: number;
    onExpire?: () => void;
    isActive: boolean;
}

const GuardianTimer: React.FC<GuardianTimerProps> = ({ initialMinutes = 30, onExpire, isActive }) => {
    const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
    const [status, setStatus] = useState<'SAFE' | 'WARNING' | 'DANGER'>('SAFE');

    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    if (onExpire) onExpire();
                    setStatus('DANGER');
                    return 0;
                }

                // Status checks
                if (prev < 300 && status !== 'WARNING') setStatus('WARNING'); // Last 5 mins
                if (prev < 60 && status !== 'DANGER') setStatus('DANGER');   // Last 1 min

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, status, onExpire]);

    const handleCheckIn = () => {
        setTimeLeft(initialMinutes * 60);
        setStatus('SAFE');
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isActive) return null;

    return (
        <div className={`fixed bottom-24 right-4 z-50 transition-all duration-300 ${status === 'DANGER' ? 'scale-110' : 'scale-100'
            }`}>
            <div className={`
        flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl
        ${status === 'SAFE' ? 'bg-indigo-900/90 border-indigo-500/50 text-white' : ''}
        ${status === 'WARNING' ? 'bg-amber-900/90 border-amber-500/50 text-amber-100 animate-pulse' : ''}
        ${status === 'DANGER' ? 'bg-red-900/95 border-red-500 text-red-100 animate-bounce shadow-red-500/50' : ''}
      `}>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-80">
                        {status === 'DANGER' ? <AlertTriangle className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                        <span>Guardian Active</span>
                    </div>
                    <div className="text-2xl font-mono font-bold tabular-nums leading-none mt-1">
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <button
                    onClick={handleCheckIn}
                    className={`
            ml-2 p-3 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 flex items-center gap-2
            ${status === 'SAFE' ? 'bg-indigo-600 hover:bg-indigo-500' : ''}
            ${status === 'WARNING' ? 'bg-amber-600 hover:bg-amber-500' : ''}
            ${status === 'DANGER' ? 'bg-white text-red-600 hover:bg-slate-100' : ''}
          `}
                >
                    {status === 'DANGER' ? (
                        <>I AM SAFE <RefreshCcw className="w-4 h-4" /></>
                    ) : (
                        <CheckCircle className="w-5 h-5" />
                    )}
                </button>
            </div>

            {status === 'DANGER' && (
                <div className="absolute -top-12 right-0 bg-red-600 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap font-bold shadow-lg">
                    Sending Alert in 30s...
                </div>
            )}
        </div>
    );
};

export default GuardianTimer;
