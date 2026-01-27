import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface WelcomeHeroProps {
    user: User;
    onMarathonClick: () => void;
}

const WelcomeHero: React.FC<WelcomeHeroProps> = ({ user, onMarathonClick }) => {
    // Time based greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 space-y-4"
        >
            {/* Hero Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl p-6">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h2 className="text-3xl font-bold mb-1">{greeting}, {user.name.split(' ')[0]}</h2>
                        <div className="flex flex-col gap-1">
                            <p className="text-indigo-100 opacity-90 flex items-center gap-2 text-sm">
                                <ShieldCheck className="w-4 h-4" /> Community Hero Level {Math.floor(user.trustScore / 10)}
                            </p>
                            {/* Level Progress */}
                            <div className="w-48 h-1.5 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                                <div
                                    className="h-full bg-white/50 rounded-full"
                                    style={{ width: `${(user.trustScore % 10) * 10}%` }}
                                ></div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                            <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Impact</p>
                            <p className="text-2xl font-bold">{user.trustScore}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                            <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Missions</p>
                            <p className="text-2xl font-bold">12</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                            <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Session Hours</p>
                            <p className="text-2xl font-bold">4.5</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Agent Callout -> Campaign Card */}
            <motion.div
                onClick={onMarathonClick}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-indigo-500/20 transition-all"
            >
                {/* Progress Bar Background */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
                    <div className="h-full bg-indigo-500 w-[45%] shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                </div>

                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center border border-indigo-500/30">
                            <BrainCircuit className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-100 text-lg">Downtown Revitalization</h3>
                            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Active Campaign</p>
                        </div>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-500/20">
                        LEVEL 4
                    </span>
                </div>

                <p className="text-slate-400 text-sm mb-4 leading-relaxed font-normal">
                    Coordinate local cleanup and repair efforts to restore the central park area sector.
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        <span className="text-slate-300">Next Reward: 500 Credits</span>
                    </div>
                    <span className="text-indigo-400">45% Complete</span>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default WelcomeHero;
