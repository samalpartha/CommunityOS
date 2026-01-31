import React from 'react';
import { Heart, Search } from 'lucide-react';

interface StepRoleSelectionProps {
    onSelectRole: (role: 'VOLUNTEER' | 'BENEFICIARY') => void;
}

const StepRoleSelection: React.FC<StepRoleSelectionProps> = ({ onSelectRole }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-6 animate-in fade-in zoom-in duration-500">
            <h1 className="text-4xl md:text-5xl font-heading font-black text-slate-900 mb-4 text-center">
                What brings you here?
            </h1>
            <p className="text-slate-500 text-lg mb-12 text-center max-w-md">
                Join the network that turns local needs into verified action.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                {/* Volunteer Card */}
                <button
                    onClick={() => onSelectRole('VOLUNTEER')}
                    className="group relative bg-white p-8 rounded-3xl border-2 border-slate-100 hover:border-rose-500 hover:shadow-2xl hover:shadow-rose-500/20 transition-all duration-300 text-left flex flex-col h-64 justify-between overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                        <Heart className="w-32 h-32 text-rose-600" fill="currentColor" />
                    </div>

                    <div className="z-10 bg-rose-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-rose-600 group-hover:text-white transition-colors duration-300">
                        <Heart className="w-7 h-7 text-rose-600 group-hover:text-white" />
                    </div>

                    <div className="z-10">
                        <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-rose-600 transition-colors">
                            I want to Help
                        </h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            Find missions nearby. deliver food, check on seniors, and report hazards to earn credits.
                        </p>
                    </div>
                </button>

                {/* Beneficiary Card */}
                <button
                    onClick={() => onSelectRole('BENEFICIARY')}
                    className="group relative bg-white p-8 rounded-3xl border-2 border-slate-100 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 text-left flex flex-col h-64 justify-between overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                        <Search className="w-32 h-32 text-indigo-600" />
                    </div>

                    <div className="z-10 bg-indigo-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                        <Search className="w-7 h-7 text-indigo-600 group-hover:text-white" />
                    </div>

                    <div className="z-10">
                        <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                            I need Resources
                        </h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            Access local food banks, request safety checks, and find verified community support.
                        </p>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default StepRoleSelection;
