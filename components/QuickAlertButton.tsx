import React, { useState } from 'react';
import { AlertCircle, Shield, X, Activity, Siren } from 'lucide-react';

interface QuickAlertButtonProps {
    onEmergency: () => void;
    onReport: () => void;
}

const QuickAlertButton: React.FC<QuickAlertButtonProps> = ({ onEmergency, onReport }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [longPressActive, setLongPressActive] = useState(false);
    let pressTimer: number;

    const handlePressStart = () => {
        setLongPressActive(true);
        pressTimer = window.setTimeout(() => {
            onEmergency();
            setLongPressActive(false);
        }, 3000); // 3 seconds to trigger SOS
    };

    const handlePressEnd = () => {
        clearTimeout(pressTimer);
        setLongPressActive(false);
    };

    if (longPressActive) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-red-600/90 backdrop-blur-sm animate-pulse">
                <Activity className="w-24 h-24 text-white animate-bounce" />
                <h1 className="text-4xl font-black text-white mt-4 uppercase tracking-widest">Hold for SOS</h1>
                <p className="text-white font-bold mt-2">Release to Cancel</p>
            </div>
        );
    }

    return (
        <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-3 pointer-events-none">
            {isExpanded && (
                <div className="flex flex-col gap-3 pointer-events-auto animate-slideUp">
                    <button
                        onClick={onReport}
                        className="bg-slate-900 text-white p-4 rounded-full shadow-xl flex items-center gap-3 pr-6 hover:bg-slate-800 transition-colors"
                    >
                        <div className="bg-slate-800 p-2 rounded-full">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                        </div>
                        <span className="font-bold">Report Incident</span>
                    </button>

                    <button
                        onTouchStart={handlePressStart}
                        onTouchEnd={handlePressEnd}
                        onMouseDown={handlePressStart}
                        onMouseUp={handlePressEnd}
                        className="bg-red-600 text-white p-4 rounded-full shadow-xl flex items-center gap-3 pr-6 hover:bg-red-700 active:scale-95 transition-all w-full justify-between group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                        <div className="bg-red-800 p-2 rounded-full z-10">
                            <Shield className="w-5 h-5" />
                        </div>
                        <span className="font-black uppercase tracking-wider z-10">Hold for SOS</span>
                    </button>
                </div>
            )}

            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`bg-red-500 hover:bg-red-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all pointer-events-auto ${isExpanded ? 'rotate-45' : ''}`}
            >
                {isExpanded ? <X className="w-6 h-6" /> : <Siren className="w-7 h-7" />}
            </button>
        </div>
    );
};

export default QuickAlertButton;
