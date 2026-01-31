import React from 'react';
import { Mission } from '../../types';
import { MapPin, Clock, Zap, ArrowRight, Heart, Shield, Leaf, Utensils, Wrench, Activity } from 'lucide-react';

interface ActionCardProps {
    mission: Mission;
    onClick: (mission: Mission) => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ mission, onClick }) => {

    // Theme logic (similar to MissionCard but refined for Action Cards)
    const getTheme = (type: string) => {
        switch (type) {
            case 'SAFETY_PATROL': return { color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'group-hover:border-indigo-500' };
            case 'ENVIRONMENTAL': return { color: 'text-green-600', bg: 'bg-green-50', border: 'group-hover:border-green-500' };
            case 'FOOD_FIT': return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'group-hover:border-orange-500' };
            case 'LONELY_MINUTES': return { color: 'text-rose-600', bg: 'bg-rose-50', border: 'group-hover:border-rose-500' };
            case 'FIX_BOUNTY': return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'group-hover:border-yellow-500' };
            case 'MEDICAL_NEED': return { color: 'text-red-600', bg: 'bg-red-50', border: 'group-hover:border-red-500' }; // Medimate
            default: return { color: 'text-slate-600', bg: 'bg-slate-50', border: 'group-hover:border-slate-400' };
        }
    };

    const theme = getTheme(mission.type);

    return (
        <button
            onClick={() => onClick(mission)}
            className={`group w-full text-left bg-white rounded-3xl p-5 mb-4 border-2 border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden ${theme.border}`}
        >
            {/* Background enhancement on hover */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${theme.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity translate-x-10 -translate-y-10`}></div>

            <div className="flex justify-between items-start mb-3 relative z-10">
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${theme.bg} ${theme.color} flex items-center gap-1.5`}>
                    {mission.type === 'SAFETY_PATROL' && <Shield className="w-3 h-3" />}
                    {mission.type === 'ENVIRONMENTAL' && <Leaf className="w-3 h-3" />}
                    {mission.type === 'FOOD_FIT' && <Utensils className="w-3 h-3" />}
                    {mission.type === 'LONELY_MINUTES' && <Heart className="w-3 h-3" />}
                    {mission.type === 'FIX_BOUNTY' && <Wrench className="w-3 h-3" />}
                    {mission.type === 'MEDICAL_NEED' && <Activity className="w-3 h-3" />}
                    {mission.type.replace('_', ' ')}
                </div>

                {mission.urgency === 'HIGH' && (
                    <div className="flex items-center gap-1 text-rose-600 font-bold text-xs animate-pulse">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                        <span>Urgent</span>
                    </div>
                )}
            </div>

            <h3 className="text-xl font-heading font-black text-slate-800 mb-2 group-hover:text-rose-600 transition-colors leading-tight">
                {mission.title}
            </h3>

            {/* Impact Metrics (The Hook) */}
            <div className="flex items-center gap-4 py-3 border-b border-slate-100 mb-3">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-slate-400 font-bold">Distance</span>
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {mission.distance}
                    </span>
                </div>
                <div className="w-px h-8 bg-slate-100"></div>
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-slate-400 font-bold">Time</span>
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {mission.timeEstimate}
                    </span>
                </div>
                <div className="w-px h-8 bg-slate-100"></div>
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-slate-400 font-bold">Impact</span>
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {mission.reward} Credits
                    </span>
                </div>
            </div>

            <div className="flex justify-between items-center relative z-10">
                <p className="text-sm text-slate-500 font-medium line-clamp-1 flex-1 mr-4">
                    {mission.description}
                </p>
                <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-rose-600 group-hover:text-white flex items-center justify-center transition-all duration-300">
                    <ArrowRight className="w-4 h-4" />
                </div>
            </div>
        </button>
    );
};

export default ActionCard;
