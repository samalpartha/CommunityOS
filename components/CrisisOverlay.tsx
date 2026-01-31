import React, { useState, useEffect } from 'react';
import { AlertTriangle, Phone, MapPin, Shield, CheckCircle, X, Radio, Siren } from 'lucide-react';

interface CrisisOverlayProps {
    isActive: boolean;
    onExit: () => void;
    onEmergencyCall: () => void;
    onReportIncident: () => void;
}

const CrisisOverlay: React.FC<CrisisOverlayProps> = ({ isActive, onExit, onEmergencyCall, onReportIncident }) => {
    const [secondsActive, setSecondsActive] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive) {
            interval = setInterval(() => {
                setSecondsActive(prev => prev + 1);
            }, 1000);
        } else {
            setSecondsActive(0);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    if (!isActive) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-zinc-950 text-white flex flex-col animate-in fade-in duration-300">
            {/* High Contrast Header */}
            <div className="bg-red-600 p-4 shrink-0 flex justify-between items-center shadow-lg animate-pulse">
                <div className="flex items-center gap-3">
                    <Siren className="w-8 h-8 text-white animate-spin-slow" style={{ animationDuration: '3s' }} />
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-widest">Crisis Mode</h1>
                        <p className="text-xs font-bold text-red-100">SYSTEM OVERRIDE • MAX VISIBILITY</p>
                    </div>
                </div>
                <div className="font-mono text-xl font-bold bg-red-800/50 px-3 py-1 rounded">
                    {new Date(secondsActive * 1000).toISOString().substr(14, 5)}
                </div>
            </div>

            {/* Main Action Grid */}
            <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
                {/* 911 Call - Primary Action */}
                <button
                    onClick={onEmergencyCall}
                    className="col-span-1 md:col-span-2 bg-white text-black rounded-3xl p-8 flex items-center justify-between group active:scale-95 transition-transform"
                >
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white shrink-0">
                            <Phone className="w-10 h-10" />
                        </div>
                        <div className="text-left">
                            <h2 className="text-4xl font-black uppercase mb-1">Call 911</h2>
                            <p className="text-lg font-bold text-zinc-600">Emergency Services</p>
                        </div>
                    </div>
                    <div className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity pr-4">
                        <AlertTriangle className="w-12 h-12" />
                    </div>
                </button>

                {/* Report Hazard */}
                <button
                    onClick={onReportIncident}
                    className="bg-zinc-800 hover:bg-zinc-700 rounded-3xl p-6 flex flex-col justify-center gap-4 border-l-8 border-orange-500 active:bg-zinc-600 transition-colors"
                >
                    <div className="bg-zinc-900 w-14 h-14 rounded-xl flex items-center justify-center text-orange-500">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-2xl font-bold">Report Hazard</h3>
                        <p className="text-zinc-400">Log incident for responders</p>
                    </div>
                </button>

                {/* Find Safe Haven */}
                <button
                    className="bg-zinc-800 hover:bg-zinc-700 rounded-3xl p-6 flex flex-col justify-center gap-4 border-l-8 border-emerald-500 active:bg-zinc-600 transition-colors"
                >
                    <div className="bg-zinc-900 w-14 h-14 rounded-xl flex items-center justify-center text-emerald-500">
                        <Shield className="w-8 h-8" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-2xl font-bold">Safe Haven</h3>
                        <p className="text-zinc-400">Nearest shelter or station</p>
                    </div>
                </button>

                {/* GPS Broadcast */}
                <div className="col-span-1 md:col-span-2 bg-zinc-900 rounded-2xl p-6 border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute top-0 right-0"></div>
                            <Radio className="w-10 h-10 text-red-500" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg">Broadcasting Location</h4>
                            <p className="text-zinc-500 text-sm font-mono">LAT: 40.7128° N • LNG: 74.0060° W</p>
                        </div>
                    </div>
                    <div className="bg-red-900/30 text-red-400 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-red-900">
                        Live Tracking
                    </div>
                </div>
            </div>

            {/* Footer / Exit */}
            <div className="p-6 bg-zinc-900 border-t border-zinc-800 shrink-0">
                <button
                    onClick={onExit}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-6 rounded-2xl text-xl flex items-center justify-center gap-3 transition-colors"
                >
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                    I AM SAFE - DEACTIVATE CRISIS MODE
                </button>
            </div>
        </div>
    );
};

export default CrisisOverlay;
