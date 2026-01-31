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
    parentId?: string; // For branching
    level: number;
    title: string;
    description: string;
    perk: string; // "Unlock: Mesh Router Access"
    reqType: MissionType | 'ANY';
    reqCount: number;
    icon: React.ReactNode;
}

const SKILL_TREES: Record<SkillRole, SkillNode[]> = {
    MEDIC: [
        { id: 'm1', level: 1, title: 'First Responder', description: 'Complete 1 medical mission.', perk: 'Unlock: First Aid Badge', reqType: MissionType.MEDICAL_NEED, reqCount: 1, icon: <Heart className="w-5 h-5" /> },
        { id: 'm2a', parentId: 'm1', level: 2, title: 'Triage Nurse', description: 'Complete 3 medical missions.', perk: 'Ability: Use Medimate Lane', reqType: MissionType.MEDICAL_NEED, reqCount: 3, icon: <Shield className="w-5 h-5" /> },
        { id: 'm2b', parentId: 'm1', level: 2, title: 'Supply Runner', description: 'Deliver 3 medical kits.', perk: '+50% IC for Delivery Missions', reqType: MissionType.MEDICAL_NEED, reqCount: 3, icon: <Zap className="w-5 h-5" /> },
        { id: 'm3', parentId: 'm2a', level: 3, title: 'Crisis Chief', description: 'Complete 10 medical missions.', perk: 'Role: Crisis Mode Admin', reqType: MissionType.MEDICAL_NEED, reqCount: 10, icon: <Star className="w-6 h-6" /> },
    ],
    BUILDER: [
        { id: 'b1', level: 1, title: 'Apprentice', description: 'Fix 1 infrastructure item.', perk: 'Unlock: Tool Library', reqType: MissionType.FIX_BOUNTY, reqCount: 1, icon: <Hammer className="w-5 h-5" /> },
        { id: 'b2', parentId: 'b1', level: 2, title: 'Site Foreman', description: 'Complete 5 fix missions.', perk: 'Ability: Create Fix Bounties', reqType: MissionType.FIX_BOUNTY, reqCount: 5, icon: <Shield className="w-5 h-5" /> },
        { id: 'b3', parentId: 'b2', level: 3, title: 'City Architect', description: 'Complete 15 fix missions.', perk: 'Access: City Planning Board', reqType: MissionType.FIX_BOUNTY, reqCount: 15, icon: <Rocket className="w-6 h-6" /> },
    ],
    DIPLOMAT: [
        { id: 'd1', level: 1, title: 'Good Neighbor', description: 'Complete 1 social mission.', perk: 'Unlock: Community Chat', reqType: MissionType.FOOD_FIT, reqCount: 1, icon: <MessageCircle className="w-5 h-5" /> },
        { id: 'd2a', parentId: 'd1', level: 2, title: 'Event Host', description: 'Host 3 gatherings.', perk: 'Ability: Create Events', reqType: MissionType.FOOD_FIT, reqCount: 3, icon: <Target className="w-5 h-5" /> },
        { id: 'd2b', parentId: 'd1', level: 2, title: 'Peacekeeper', description: 'Resolve 3 disputes.', perk: 'Role: Conflict Mediator', reqType: MissionType.FOOD_FIT, reqCount: 3, icon: <Trophy className="w-5 h-5" /> },
        { id: 'd3', parentId: 'd2a', level: 3, title: 'Ambassador', description: 'Complete 20 social missions.', perk: 'Status: City Council Rep', reqType: MissionType.FOOD_FIT, reqCount: 20, icon: <Rocket className="w-6 h-6" /> },
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

    const renderNode = (node: SkillNode) => {
        const isUnlocked = currentCount >= node.reqCount;
        const parent = node.parentId ? nodes.find(n => n.id === node.parentId) : null;
        const parentUnlocked = !parent || currentCount >= parent.reqCount;
        const isNext = !isUnlocked && parentUnlocked;

        return (
            <button
                onClick={() => setSelectedNode(node)}
                className="relative group transition-all hover:scale-105 z-20"
            >
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border-4 shadow-xl transition-all ${isUnlocked
                    ? `bg-gradient-to-br ${getThemeColor()} border-white text-white`
                    : isNext
                        ? 'bg-white dark:bg-slate-800 border-indigo-500 text-indigo-500 border-dashed animate-pulse ring-4 ring-indigo-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300 grayscale opacity-70'
                    }`}>
                    {isUnlocked ? <CheckCircle className="w-8 h-8" /> : node.icon}

                    {/* Level Badge */}
                    <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-xs font-heading font-black border-2 border-white dark:border-slate-900 shadow-sm ${isUnlocked ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                        }`}>
                        {node.level}
                    </div>
                </div>

                <div className="absolute top-24 left-1/2 -translate-x-1/2 w-48 text-center">
                    <p className={`text-sm font-bold ${isUnlocked ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{node.title}</p>
                    {isUnlocked && <p className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full inline-block mt-1">UNLOCKED</p>}
                </div>
            </button>
        );
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
                <div className="p-8 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-950">
                    <div className="max-w-3xl mx-auto">
                        {/* Tree Container */}
                        <div className="relative flex flex-col items-center gap-12 min-h-[400px] py-10">

                            {/* Level 1 - Root */}
                            <div className="z-10">
                                {renderNode(nodes.find(n => n.level === 1)!)}
                            </div>

                            {/* Level 2 - Branches */}
                            <div className="flex justify-center gap-16 z-10 w-full relative">
                                {/* Connector Lines Logic would go here ideally with SVG, simplified visually with CSS for now */}
                                <div className="absolute top-[-24px] left-1/2 -translate-x-1/2 w-[60%] h-[2px] bg-slate-300 dark:bg-slate-700 -z-10" />
                                <div className="absolute top-[-24px] left-1/2 -translate-x-1/2 w-0.5 h-6 bg-slate-300 dark:bg-slate-700 -z-10" />

                                {nodes.filter(n => n.level === 2).map(node => (
                                    <div key={node.id} className="relative flex flex-col items-center">
                                        <div className="absolute top-[-24px] w-0.5 h-6 bg-slate-300 dark:bg-slate-700 -z-10" />
                                        {renderNode(node)}
                                    </div>
                                ))}
                            </div>

                            {/* Level 3 - Branches */}
                            <div className="flex justify-center gap-16 z-10 w-full">
                                {nodes.filter(n => n.level === 3).map(node => (
                                    <div key={node.id} className="relative flex flex-col items-center">
                                        <div className="absolute top-[-24px] w-0.5 h-6 bg-slate-300 dark:bg-slate-700 -z-10" />
                                        {renderNode(node)}
                                    </div>
                                ))}
                            </div>

                        </div>

                        {/* Perk Unlock Notification / Selected Details */}
                        {selectedNode && (
                            <div className="mt-8 bg-white dark:bg-slate-900 rings-1 ring-slate-200 dark:ring-slate-800 p-6 rounded-2xl shadow-xl animate-in slide-in-from-bottom duration-300 sticky bottom-0 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-heading text-slate-900 dark:text-white flex items-center gap-2">
                                            {selectedNode.title}
                                            {currentCount >= selectedNode.reqCount ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Shield className="w-5 h-5 text-slate-300" />}
                                        </h3>
                                        <p className="text-sm text-indigo-500 font-bold">{selectedNode.perk}</p>
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
                                    label="Mastery Progress"
                                    variant={currentCount >= selectedNode.reqCount ? 'success' : 'gradient'}
                                    showPercentage={true}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkillTreeModal;
