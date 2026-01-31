import React, { useState } from 'react';
import { MapPin, Navigation, ArrowRight } from 'lucide-react';

interface StepLocationProps {
    onGrantLocation: () => Promise<void>;
    isLocating: boolean;
}

const StepLocation: React.FC<StepLocationProps> = ({ onGrantLocation, isLocating }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="w-full max-w-md text-center">

                <div className="relative inline-block mb-8">
                    <div className="absolute inset-0 bg-rose-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                    <div className="relative bg-white p-6 rounded-3xl shadow-xl shadow-rose-500/10 mb-4">
                        <div className="bg-rose-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto">
                            <MapPin className="w-10 h-10 text-rose-600" fill="currentColor" />
                        </div>
                    </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-heading font-black text-slate-900 mb-4">
                    Find missions nearby
                </h1>

                <p className="text-slate-500 text-lg mb-10 leading-relaxed">
                    We use your location to show you urgent needs within <strong className="text-slate-800">0.5 miles</strong> of you. No tracking history is stored.
                </p>

                <button
                    onClick={onGrantLocation}
                    disabled={isLocating}
                    className="w-full bg-rose-600 text-white font-bold text-lg py-5 rounded-2xl shadow-xl shadow-rose-500/30 hover:bg-rose-700 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                    {isLocating ? (
                        <>
                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Locating...</span>
                        </>
                    ) : (
                        <>
                            <Navigation className="w-6 h-6 fill-current" />
                            <span>Enable Location</span>
                        </>
                    )}
                </button>

                <div className="mt-6">
                    <button className="text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors">
                        Enter manually instead
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StepLocation;
