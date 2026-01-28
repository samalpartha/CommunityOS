import React, { useState } from 'react';
import { X, Heart, Hammer, MessageCircle, CheckCircle, Shield, Star, Zap, Trophy, Rocket, Target } from 'lucide-react';
import { Mission, MissionType } from '../types';
import { Badge, ProgressBar } from './index';

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
    angle?: number; // For radial layout
}

const SKILL_TREES: Record<SkillRole, SkillNode[]> = {
    MEDIC: [
        { id: 'm1', level: 1, title: 'First Responder', description: 'Complete your first medical or wellness check.', reqType: MissionType.MEDICAL_NEED, reqCount: 1, icon: <Heart className="w-5 h-5" />, angle: 0 },
        { id: 'm2', level: 2, title: 'Community Caretaker', description: 'Complete 3 medical missions.', reqType: MissionType.MEDICAL_NEED, reqCount: 3, icon: <Shield className="w-5 h-5" />, angle: 120 },
        { id: 'm3', level: 3, title: 'Crisis Stabilizer', description: 'Complete 10 medical missions.', reqType: MissionType.MEDICAL_NEED, reqCount: 10, icon: <Zap className="w-5 h-5" />, angle: 240 },
    ],
    BUILDER: [
        { id: 'b1', level: 1, title: 'Handy Helper', description: 'Fix your first broken infrastructure item.', reqType: MissionType.FIX_BOUNTY, reqCount: 1, icon: <Hammer className="w-5 h-5" />, angle: 0 },
        { id: 'b2', level: 2, title: 'Street Guardian', description: 'Complete 3 fix missions.', reqType: MissionType.FIX_BOUNTY, reqCount: 3, icon: <Shield className="w-5 h-5" />, angle: 120 },
        { id: 'b3', level: 3, title: 'City Architect', description: 'Complete 10 fix missions.', reqType: MissionType.FIX_BOUNTY, reqCount: 10, icon: <Rocket className="w-5 h-5" />, angle: 240 },
    ],
    DIPLOMAT: [
        { id: 'd1', level: 1, title: 'Good Neighbor', description: 'Complete a food or social mission.', reqType: MissionType.FOOD_FIT, reqCount: 1, icon: <MessageCircle className="w-5 h-5" />, angle: 0 },
        { id: 'd2', level: 2, title: 'Connector', description: 'Complete 3 social missions.', reqType: MissionType.FOOD_FIT, reqCount: 3, icon: <Star className="w-5 h-5" />, angle: 120 },
        { id: 'd3', level: 3, title: 'Peacekeeper', description: 'Complete 10 social missions.', reqType: MissionType.FOOD_FIT, reqCount: 10, icon: <Trophy className="w-5 h-5" />, angle: 240 },
    ]
};

const SkillTreeModal: React.FC<SkillTreeModalProps> = ({ isOpen, onClose, completedMissions }) => {
    const [activeTab, setActiveTab] = useState<SkillRole>('MEDIC');
    const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);

    if (!isOpen) return null;

    const getProgress = (role: SkillRole) => {
        const type = role === 'MEDIC' ? MissionType.MEDICAL_NEED :
            role === 'BUILDER' ? MissionType.FIX_BOUNTY :
                MissionType.FOOD_FIT;

        if (role === 'DIPLOMAT') {
            return completedMissions.filter(m => m.status === 'VERIFIED' && (m.type === MissionType.FOOD_FIT || m.type === MissionType.LONELY_MINUTES)).length;
        }

        return completedMissions.filter(m => m.status === 'VERIFIED' && m.type === type).length;
    };

    const currentCount = getProgress(activeTab);
    const nodes = SKILL_TREES[activeTab];

    // Theme color by role
    const getThemeColor = () => {
        switch (activeTab) {
            case 'MEDIC': return 'from-red-500 to-rose-600';
            case 'BUILDER': return 'from-amber-500 to-orange-600';
            case 'DIPLOMAT': return 'from-blue-500 to-indigo-600';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
                {/* Header */}
                <div className={`p-6 bg-gradient-to-r ${getThemeColor()} text-white flex justify-between items-center shrink-0`}>
                    <div>
                        <h2 className="text-3xl font-heading">Career Mastery</h2>
                        <p className="text-white/80 text-sm">Unlock your community superpowers</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-950">
                    {(['MEDIC', 'BUILDER', 'DIPLOMAT'] as SkillRole[]).map(role => {
                        const roleProgress = getProgress(role);
                        const roleNodes = SKILL_TREES[role];
                        const maxPossible = roleNodes[roleNodes.length - 1].reqCount;

                        return (
                            <button
                                key={role}
                                onClick={() => {
                                    setActiveTab(role);
                                    setSelectedNode(null);
                                }}
                                className={`flex-1 py-4 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === role
                                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-b-4 border-primary'
                                        : 'bg-slate-50 dark:bg-slate-950 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                    }`}
                            >
                                <div className="flex flex-col items-center gap-1">
                                    <span>{role}</span>
                                    <Badge variant={roleProgress >= maxPossible ? 'completed' : 'active'} className="text-[10px]">
                                        {roleProgress} / {maxPossible}
                                    </Badge>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-1">
                    {/* Radial Skill Tree */}
                    <div className="relative w-full aspect-square max-w-md mx-auto">
                        {/* Center Hub */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getThemeColor()} flex items-center justify-center shadow-2xl border-4 border-white dark:border-slate-900`}>
                                <div className="text-center text-white">
                                    <p className="text-2xl font-heading">{currentCount}</p>
                                    <p className="text-[10px] font-bold uppercase">Missions</p>
                                </div>
                            </div>
                        </div>

                        {/* Skill Nodes in Radial Pattern */}
                        {nodes.map((node, index) => {
                            const isUnlocked = currentCount >= node.reqCount;
                            const isNext = !isUnlocked && (index === 0 || currentCount >= nodes[index - 1].reqCount);

                            // Calculate position
                            const radius = 140;
                            const angleRad = (node.angle! * Math.PI) / 180;
                            const x = Math.cos(angleRad) * radius;
                            const y = Math.sin(angleRad) * radius;

                            return (
                                <React.Fragment key={node.id}>
                                    {/* Connecting Line to Center */}
                                    <svg
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none"
                                        style={{ zIndex: 0 }}
                                    >
                                        <line
                                            x1="50%"
                                            y1="50%"
                                            x2={`calc(50% + ${x}px)`}
                                            y2={`calc(50% + ${y}px)`}
                                            stroke={isUnlocked ? '#10B981' : isNext ? '#E11D48' : '#CBD5E1'}
                                            strokeWidth={isUnlocked ? 4 : 2}
                                            strokeDasharray={isNext ? '5,5' : undefined}
                                            className={isNext ? 'animate-pulse' : ''}
                                        />
                                    </svg>

                                    {/* Node */}
                                    <button
                                        onClick={() => setSelectedNode(node)}
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 transition-all hover:scale-110"
                                        style={{
                                            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                                        }}
                                    >
                                        <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center border-4 shadow-lg transition-all ${isUnlocked
                                                ? `bg-gradient-to-br ${getThemeColor()} border-white text-white`
                                                : isNext
                                                    ? 'bg-white dark:bg-slate-800 border-primary text-primary border-dashed animate-pulse'
                                                    : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400'
                                            }`}>
                                            {isUnlocked ? <CheckCircle className="w-8 h-8" /> : node.icon}

                                            {/* Level Badge */}
                                            <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-heading font-bold ${isUnlocked ? 'bg-success text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                                }`}>
                                                {node.level}
                                            </div>
                                        </div>

                                        {/* Title below node */}
                                        <p className={`text-xs font-bold mt-2 text-center max-w-[80px] ${isUnlocked ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                                            }`}>
                                            {node.title.split(' ')[0]}
                                        </p>
                                    </button>
                                </React.Fragment>
                            );
                        })}
                    </div>

                    {/* Selected Node Details */}
                    {selectedNode && (
                        <div className="mt-8 bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border-l-4 border-primary animate-in slide-in-from-bottom duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-heading text-slate-900 dark:text-white">{selectedNode.title}</h3>
                                    <Badge variant={currentCount >= selectedNode.reqCount ? 'completed' : 'active'} className="mt-2">
                                        Level {selectedNode.level}
                                    </Badge>
                                </div>
                                <button
                                    onClick={() => setSelectedNode(null)}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-slate-600 dark:text-slate-300 mb-4">{selectedNode.description}</p>

                            <ProgressBar
                                current={Math.min(currentCount, selectedNode.reqCount)}
                                max={selectedNode.reqCount}
                                label="Progress"
                                variant={currentCount >= selectedNode.reqCount ? 'success' : 'gradient'}
                                showPercentage={true}
                            />

                            {currentCount >= selectedNode.reqCount && (
                                <div className="mt-4 flex items-center gap-2 text-success">
                                    <Trophy className="w-5 h-5" />
                                    <span className="font-bold">Mastered! You've unlocked this skill.</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SkillTreeModal;
