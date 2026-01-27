import React from 'react';
import { X, Share2, Map as MapIcon, Globe } from 'lucide-react';
import MapView from './MapView';
import { Mission, MissionStatus, User } from '../types';
import { INITIAL_RESOURCES } from '../constants'; // Just for map completeness

interface ServiceMapProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    allMissions: Mission[];
    onShare?: () => void;
}

const ServiceMap: React.FC<ServiceMapProps> = ({ isOpen, onClose, user, allMissions, onShare }) => {
    if (!isOpen) return null;

    // Filter for missions completed by the user (or just verified ones for now as we don't strictly track 'completedBy' in this MVP mock)
    // In a real app, strict filtering by user.id is needed.
    // For this MVP, we assume verified missions in the local state are 'ours' broadly or just filter by status.
    const completedMissions = allMissions.filter(m => m.status === MissionStatus.VERIFIED);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">

                {/* Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur shrink-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full text-indigo-600 dark:text-indigo-400">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900 dark:text-white">Service Map</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {completedMissions.length} Missions Completed
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onShare}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-indigo-500"
                            title="Share Map"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-red-500"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Map Container */}
                <div className="flex-1 relative bg-slate-100 dark:bg-slate-950">
                    {completedMissions.length > 0 ? (
                        <MapView
                            missions={completedMissions}
                            resources={[]} // Don't distract with resources
                            onMissionClick={(m) => { }}
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                            <MapIcon className="w-16 h-16 mb-4 opacity-20" />
                            <p>No completed missions yet.</p>
                            <p className="text-sm">Go complete a mission to see your impact!</p>
                        </div>
                    )}

                    {/* Overlay Stats */}
                    <div className="absolute bottom-6 left-6 pointer-events-none">
                        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur p-4 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 pointer-events-auto">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Impact</div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white">
                                {user.impactCredits} <span className="text-sm font-normal text-indigo-500">IC</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceMap;
