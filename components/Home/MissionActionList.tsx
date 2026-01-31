import React from 'react';
import { Mission } from '../../types';
import ActionCard from './ActionCard';
import WelcomeHero from '../WelcomeHero';

interface MissionActionListProps {
    missions: Mission[];
    user: any;
    onMissionClick: (mission: Mission) => void;
    onMarathonClick: () => void;
}

const MissionActionList: React.FC<MissionActionListProps> = ({ missions, user, onMissionClick, onMarathonClick }) => {
    // Sort logic: Urgent first, then distance
    const sortedMissions = [...missions].sort((a, b) => {
        if (a.urgency === 'HIGH' && b.urgency !== 'HIGH') return -1;
        if (a.urgency !== 'HIGH' && b.urgency === 'HIGH') return 1;
        // Parse distance
        const distA = a.distance === 'N/A' ? 999 : parseFloat(a.distance);
        const distB = b.distance === 'N/A' ? 999 : parseFloat(b.distance);
        return distA - distB;
    });

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto pb-24 md:pb-6 relative">
            <div className="p-4 space-y-4">
                <WelcomeHero user={user} onMarathonClick={onMarathonClick} />

                <div className="flex justify-between items-end mt-6 mb-2 px-1">
                    <div>
                        <h2 className="text-xl font-heading font-black text-slate-900 dark:text-white">
                            Recommended Actions
                        </h2>
                        <p className="text-slate-500 text-xs font-medium">
                            Based on your location and skills
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {sortedMissions.map(mission => (
                        <div key={mission.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <ActionCard mission={mission} onClick={onMissionClick} />
                        </div>
                    ))}
                </div>

                {sortedMissions.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                        <p>No missions found nearby. You're all clear!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MissionActionList;
