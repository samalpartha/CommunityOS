import React, { useState } from 'react';
import { Mission } from '../types';
import { MapPin, Zap, ChevronDown, ChevronUp, Layers, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MissionBundleCardProps {
    missions: Mission[];
    onStartBundle: (missions: Mission[]) => void;
}

const MissionBundleCard: React.FC<MissionBundleCardProps> = ({ missions, onStartBundle }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const totalReward = missions.reduce((acc, m) => acc + m.reward, 0);
    const primaryMission = missions[0];
    const location = primaryMission.location;

    // Calculate total time estimate (rough approximation)
    const totalTimeEst = missions.reduce((acc, m) => {
        const time = parseInt(m.timeEstimate) || 0;
        return acc + time;
    }, 0);
    // Note: detailed parsing would be better, but this is a quick visual.

    return (
        <div className="w-full mb-3 relative group">
            {/* Stack Effect Backgrounds */}
            <div className="absolute top-2 left-2 right-2 bottom-0 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm opacity-50 z-0 scale-[0.98] translate-y-1"></div>
            <div className="absolute top-4 left-4 right-4 bottom-0 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm opacity-30 z-[-1] scale-[0.96] translate-y-2"></div>

            {/* Main Card */}
            <div className="relative z-10 bg-white dark:bg-slate-800 rounded-xl border-l-[6px] border-l-indigo-500 border-y border-r border-slate-200 dark:border-slate-700 shadow-md p-4 transition-all hover:shadow-lg">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white leading-tight">
                                {missions.length} Missions Bundle
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                <MapPin className="w-3 h-3" /> {location}
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full shadow-sm flex items-center gap-1 font-bold text-xs">
                        <Zap className="w-3 h-3 fill-current" /> +{totalReward} XP
                    </div>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                    Complete all {missions.length} tasks in one go! Efficient route detected.
                </p>

                {/* Sub-missions List (Collapsible) */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mb-4 space-y-2 border-t border-slate-100 dark:border-slate-700 pt-2"
                        >
                            {missions.map(m => (
                                <div key={m.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
                                    <span className="font-medium truncate flex-1">{m.title}</span>
                                    <span className="text-slate-400">{m.reward} XP</span>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex gap-2">
                    <button
                        onClick={() => onStartBundle(missions)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors shadow-indigo-500/20 shadow-lg"
                    >
                        Start Bundle <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
                    >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MissionBundleCard;
