import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Search, Map as MapIcon, Plus, Mic, User as UserIcon, Sun, Moon, HelpCircle, LogOut, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import HourTracker from './HourTracker';
import { generateCertificate } from '../utils/certificateExport';
import { seedMissions } from '../services/firestoreService';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

interface SidebarProps {
    user: User;
    activeTab: string;
    setActiveTab: (tab: any) => void;
    setIsCreatingReport: (val: boolean) => void;
    activeVoiceMode: boolean;
    isMeshMode: boolean;
    setIsMeshMode: (val: boolean) => void;
    darkMode: boolean;
    setDarkMode: (val: boolean) => void;
    setShowHelp: (val: boolean) => void;
    onLogout: () => void;
    addToast: (type: 'success' | 'error', title: string, message: string) => void;
    setUser: React.Dispatch<React.SetStateAction<any>>;
}

const SidebarItem = ({
    active,
    onClick,
    icon: Icon,
    label,
    id,
    colorClass = "bg-indigo-600"
}: {
    active: boolean;
    onClick: () => void;
    icon: any;
    label: string;
    id: string;
    colorClass?: string;
}) => (
    <button
        onClick={onClick}
        className={`relative flex items-center gap-3 w-full p-3 rounded-xl transition-colors z-10 group ${active ? 'text-white' : 'text-slate-400 hover:text-slate-100'}`}
    >
        {active && (
            <motion.div
                layoutId="activeTab"
                className={`absolute inset-0 shadow-lg rounded-xl z-[-1] ${colorClass}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
        )}
        <Icon className={`w-5 h-5 z-10 transition-transform group-hover:scale-110 ${active ? 'fill-current opacity-100' : 'opacity-70'}`} />
        <span className="z-10 font-bold tracking-tight">{label}</span>
    </button>
);

const Sidebar: React.FC<SidebarProps> = ({
    user,
    activeTab,
    setActiveTab,
    setIsCreatingReport,
    activeVoiceMode,
    isMeshMode,
    setIsMeshMode,
    darkMode,
    setDarkMode,
    setShowHelp,
    onLogout,
    addToast,
    setUser
}) => {
    return (
        <motion.nav
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="hidden md:flex flex-col w-72 bg-slate-900/95 backdrop-blur-2xl text-white p-6 shrink-0 h-full border-r border-slate-800 shadow-2xl z-50 overflow-hidden"
        >
            {/* Header - Fixed */}
            <div className="mb-6 flex items-center gap-2 shrink-0">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-500/20 shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-heading tracking-tight">Community<span className="text-indigo-400">Hero</span></h1>
                    <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Community OS v2.0</p>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 min-h-0 custom-scrollbar">
                <LayoutGroup>
                    <div className="space-y-2">
                        <SidebarItem
                            id="FIND"
                            label="Find Help"
                            icon={Search}
                            active={activeTab === 'FIND'}
                            onClick={() => setActiveTab('FIND')}
                        />

                        <SidebarItem
                            id="MEDIMATE"
                            label="Medimate Lane"
                            icon={Heart}
                            active={activeTab === 'MEDIMATE'}
                            onClick={() => setActiveTab('MEDIMATE')}
                            colorClass="bg-red-600 shadow-red-500/30"
                        />

                        <SidebarItem
                            id="MISSIONS"
                            label="Missions"
                            icon={MapIcon}
                            active={activeTab === 'MISSIONS'}
                            onClick={() => setActiveTab('MISSIONS')}
                        />

                        <button
                            onClick={() => setIsCreatingReport(true)}
                            className="flex items-center gap-3 w-full p-3 rounded-xl transition-all hover:bg-slate-800 text-indigo-300 hover:text-white group border border-dashed border-slate-700 hover:border-indigo-500"
                        >
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            <span className="font-bold">Post Mission</span>
                        </button>

                        <SidebarItem
                            id="VOICE"
                            label="Voice Mode"
                            icon={Mic}
                            active={activeTab === 'VOICE'}
                            onClick={() => setActiveTab('VOICE')}
                        />

                        <SidebarItem
                            id="PROFILE"
                            label="Profile"
                            icon={UserIcon}
                            active={activeTab === 'PROFILE'}
                            onClick={() => setActiveTab('PROFILE')}
                        />

                        {user.role === UserRole.COUNSELOR && (
                            <SidebarItem
                                id="COUNSELOR"
                                label="Counselor Dashboard"
                                icon={ShieldCheck}
                                active={activeTab === 'COUNSELOR'}
                                onClick={() => setActiveTab('COUNSELOR')}
                                colorClass="bg-indigo-900 shadow-indigo-900/50"
                            />
                        )}
                    </div>
                </LayoutGroup>

                {/* Hour Tracker Widget */}
                <AnimatePresence>
                    {(user.role === UserRole.STUDENT || user.studentData) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <HourTracker
                                user={user}
                                onExportCertificate={() => {
                                    generateCertificate(user);
                                    addToast('success', 'Certificate Downloaded', 'Your volunteer certificate has been saved as a PDF!');
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer Section - Fixed */}
            <div className="mt-4 pt-4 border-t border-white/5 shrink-0 space-y-3">
                <button
                    onClick={() => setShowHelp(true)}
                    className="flex items-center gap-3 w-full p-3 rounded-xl transition-colors text-slate-400 hover:bg-slate-800 hover:text-white group"
                >
                    <HelpCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-bold">Help & Guide</span>
                </button>

                <button
                    onClick={() => setIsMeshMode(!isMeshMode)}
                    className={`w-full text-xs font-bold py-2.5 rounded-xl transition-all border ${isMeshMode
                        ? 'bg-orange-500/20 text-orange-200 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                        : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-800'
                        }`}
                >
                    {isMeshMode ? 'Mesh Mode: Signal Active' : 'Enable Mesh Network'}
                </button>

                <div className="flex items-center gap-3 pt-2">
                    <div className="relative">
                        <img src={user.avatarUrl} className="w-10 h-10 rounded-full border-2 border-indigo-500/50" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{user.name}</p>
                        <p className="text-xs text-indigo-400 font-mono">Level {Math.floor(user.trustScore / 10)} Hero</p>
                    </div>
                    <button
                        onClick={onLogout}
                        className="p-2 hover:bg-rose-500/20 hover:text-rose-400 rounded-lg transition-colors text-slate-500"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </motion.nav>
    );
};

export default Sidebar;
