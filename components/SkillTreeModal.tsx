import React, { useState } from 'react';
import { X, Heart, Hammer, MessageCircle, Lock, CheckCircle, Shield, Star, Zap } from 'lucide-react';
import { Mission, MissionType } from '../types';

interface SkillTreeModalProps {
    isOpen: boolean;
    onClose: () => void;
    completedMissions: Mission[];
}

type SkillRole = 'MEDIC' | 'BUILDER' | 'DIPLOMAT';

interface SkillNode {
    id: string;
    level: number;
    title: string;
    description: string;
    reqType: MissionType | 'ANY';
    reqCount: number;
    icon: React.ReactNode;
}

const SKILL_TREES: Record<SkillRole, SkillNode[]> = {
    MEDIC: [
        { id: 'm1', level: 1, title: 'First Responder', description: 'Complete your first medical or wellness check.', reqType: MissionType.MEDICAL_NEED, reqCount: 1, icon: <Heart className="w-5 h-5" /> },
        { id: 'm2', level: 2, title: 'Community Caretaker', description: 'Complete 3 medical missions.', reqType: MissionType.MEDICAL_NEED, reqCount: 3, icon: <Shield className="w-5 h-5" /> },
        { id: 'm3', level: 3, title: 'Crisis Stabilizer', description: 'Complete 10 medical missions.', reqType: MissionType.MEDICAL_NEED, reqCount: 10, icon: <Zap className="w-5 h-5" /> },
    ],
    BUILDER: [
        { id: 'b1', level: 1, title: 'Handy Helper', description: 'Fix your first broken infrastructure item.', reqType: MissionType.FIX_BOUNTY, reqCount: 1, icon: <Hammer className="w-5 h-5" /> },
        { id: 'b2', level: 2, title: 'Street Guardian', description: 'Complete 3 fix missions.', reqType: MissionType.FIX_BOUNTY, reqCount: 3, icon: <Shield className="w-5 h-5" /> },
        { id: 'b3', level: 3, title: 'City Architect', description: 'Complete 10 fix missions.', reqType: MissionType.FIX_BOUNTY, reqCount: 10, icon: <Zap className="w-5 h-5" /> },
    ],
    DIPLOMAT: [
        { id: 'd1', level: 1, title: 'Good Neighbor', description: 'Complete a food or social mission.', reqType: MissionType.FOOD_FIT, reqCount: 1, icon: <MessageCircle className="w-5 h-5" /> },
        { id: 'd2', level: 2, title: 'Connector', description: 'Complete 3 social missions.', reqType: MissionType.FOOD_FIT, reqCount: 3, icon: <Star className="w-5 h-5" /> },
        { id: 'd3', level: 3, title: 'Peacekeeper', description: 'Complete 10 social missions.', reqType: MissionType.FOOD_FIT, reqCount: 10, icon: <Zap className="w-5 h-5" /> },
    ]
};

const SkillTreeModal: React.FC<SkillTreeModalProps> = ({ isOpen, onClose, completedMissions }) => {
    const [activeTab, setActiveTab] = useState<SkillRole>('MEDIC');

    if (!isOpen) return null;

    const getProgress = (role: SkillRole) => {
        const type = role === 'MEDIC' ? MissionType.MEDICAL_NEED :
            role === 'BUILDER' ? MissionType.FIX_BOUNTY :
                MissionType.FOOD_FIT;

        // Count verified missions of this type
        // Also include LIFE_SKILL for general XP or specific roles if needed, keeping simple for now
        // Maybe LONELY_MINUTES counts for MEDIC/DIPLOMAT too?
        // Let's keep it simple: strict type matching for MVP

        // For DIPLOMAT, let's include LONELY_MINUTES as well
        if (role === 'DIPLOMAT') {
            return completedMissions.filter(m => m.status === 'VERIFIED' && (m.type === MissionType.FOOD_FIT || m.type === MissionType.LONELY_MINUTES)).length;
        }

        return completedMissions.filter(m => m.status === 'VERIFIED' && m.type === type).length;
    };

    const currentCount = getProgress(activeTab);
    const nodes = SKILL_TREES[activeTab];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold dark:text-white">Skill Trees</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Track your role mastery</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 dark:border-slate-800 shrink-0">
                    {(['MEDIC', 'BUILDER', 'DIPLOMAT'] as SkillRole[]).map(role => (
                        <button
                            key={role}
                            onClick={() => setActiveTab(role)}
                            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === role
                                    ? 'bg-white dark:bg-slate-900 text-indigo-600 border-b-2 border-indigo-600'
                                    : 'bg-slate-50 dark:bg-slate-950 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                }`}
                        >
                            {role}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="flex flex-col gap-8 relative">
                        {/* Connecting Line (vertical) */}
                        <div className="absolute left-8 top-8 bottom-8 w-1 bg-slate-100 dark:bg-slate-800 -z-10" />

                        {nodes.map((node, index) => {
                            const isUnlocked = currentCount >= node.reqCount;
                            const isNext = !isUnlocked && (index === 0 || currentCount >= nodes[index - 1].reqCount);

                            return (
                                <div key={node.id} className={`flex gap-6 items-start group ${isUnlocked ? 'opacity-100' : isNext ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                                    {/* Icon Bubble */}
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border-4 z-10 transition-all ${isUnlocked
                                            ? 'bg-indigo-600 border-indigo-100 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                                            : isNext
                                                ? 'bg-white dark:bg-slate-800 border-indigo-500 text-indigo-500 border-dashed animate-pulse'
                                                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                                        }`}>
                                        {isUnlocked ? <CheckCircle className="w-8 h-8" /> : node.icon}
                                    </div>

                                    {/* Content Card */}
                                    <div className={`flex-1 bg-white dark:bg-slate-800 p-4 rounded-xl border transition-all ${isUnlocked
                                            ? 'border-indigo-100 dark:border-indigo-900 shadow-sm'
                                            : 'border-slate-100 dark:border-slate-700'
                                        }`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg dark:text-white">{node.title}</h3>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${isUnlocked ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700'
                                                }`}>
                                                Lvl {node.level}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">{node.description}</p>

                                        {/* Progress Bar */}
                                        <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${isUnlocked ? 'bg-green-500' : 'bg-indigo-500'}`}
                                                style={{ width: `${Math.min(100, (currentCount / node.reqCount) * 100)}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-1 text-xs font-bold text-slate-400">
                                            <span>{Math.min(currentCount, node.reqCount)} / {node.reqCount} Missions</span>
                                            {!isUnlocked && <span>{isNext ? 'In Progress' : 'Locked'}</span>}
                                            {isUnlocked && <span className="text-green-600 dark:text-green-400">Mastered</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkillTreeModal;
