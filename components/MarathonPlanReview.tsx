import React, { useState } from 'react';
import { Mission, MissionType } from '../types';
import { CheckCircle2, X, BrainCircuit, Calendar, MapPin, Trash2, ArrowRight } from 'lucide-react';

interface MarathonPlanReviewProps {
    goal: string;
    proposedMissions: Mission[];
    onConfirm: (finalMissions: Mission[]) => void;
    onCancel: () => void;
}

const MarathonPlanReview: React.FC<MarathonPlanReviewProps> = ({ goal, proposedMissions, onConfirm, onCancel }) => {
    const [missions, setMissions] = useState<Mission[]>(proposedMissions);

    const handleRemove = (id: string) => {
        setMissions(prev => prev.filter(m => m.id !== id));
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-t-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-indigo-500/10 p-2 rounded-lg">
                            <BrainCircuit className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold dark:text-white">Strategic Plan Review</h2>
                            <p className="text-sm text-slate-500">Gemini 3 Pro Proposal</p>
                        </div>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border-l-4 border-indigo-500">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Goal: "{goal}"</p>
                    </div>
                </div>

                {/* Mission List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {missions.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <p>No missions remaining. Cancel to try again.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {missions.map((mission, index) => (
                                <div key={mission.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex gap-4 group hover:border-indigo-500/50 transition-colors shadow-sm">
                                    <div className="flex-shrink-0 flex flex-col items-center gap-1 min-w-[3rem]">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                                            {index + 1}
                                        </div>
                                        {index < missions.length - 1 && (
                                            <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-800 min-h-[20px]" />
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-slate-800 dark:text-slate-200">{mission.title}</h3>
                                            <button
                                                onClick={() => handleRemove(mission.id)}
                                                className="text-slate-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Remove this step"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{mission.description}</p>

                                        <div className="flex gap-3 mt-3">
                                            <span className={`text-[10px] items-center gap-1 flex px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium`}>
                                                <Calendar className="w-3 h-3" /> {mission.timeEstimate}
                                            </span>
                                            <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-bold ${mission.urgency === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    mission.urgency === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                }`}>
                                                {mission.urgency}
                                            </span>
                                            <span className="text-[10px] px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 font-bold ml-auto">
                                                +{mission.reward} Credits
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-between bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
                    <button
                        onClick={onCancel}
                        className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
                    >
                        Edit Strategy
                    </button>
                    <button
                        onClick={() => onConfirm(missions)}
                        disabled={missions.length === 0}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50 disabled:shadow-none transition-all"
                    >
                        <CheckCircle2 className="w-5 h-5" /> Execute Plan
                    </button>
                </div>

            </div>
        </div>
    );
};

export default MarathonPlanReview;
