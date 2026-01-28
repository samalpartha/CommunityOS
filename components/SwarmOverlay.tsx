import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, Radio, ShieldAlert, ArrowRight } from 'lucide-react';

interface SwarmOverlayProps {
    isActive: boolean;
    onDeactivate: () => void;
}

const SwarmOverlay: React.FC<SwarmOverlayProps> = ({ isActive, onDeactivate }) => {
    return (
        <AnimatePresence>
            {isActive && (
                <>
                    {/* Full Screen Warning Hue */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.15 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-red-600 z-[90] pointer-events-none mix-blend-overlay"
                    />

                    {/* Top Tactical Banner */}
                    <motion.div
                        initial={{ y: -100 }}
                        animate={{ y: 0 }}
                        exit={{ y: -100 }}
                        className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white shadow-2xl shadow-red-900/50"
                    >
                        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    animate={{ opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                >
                                    <Radio className="w-6 h-6" />
                                </motion.div>
                                <div className="font-mono uppercase font-black tracking-widest text-lg">
                                    SWARM PROTOCOL ACTIVE
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="hidden md:flex flex-col items-end">
                                    <span className="text-xs text-red-100 font-mono">MOBILIZATION</span>
                                    <span className="font-bold font-mono">42 AGENTS ACTIVE</span>
                                </div>
                                <button
                                    onClick={onDeactivate}
                                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-1 rounded font-bold text-sm transition-colors border border-white/30"
                                >
                                    STAND DOWN
                                </button>
                            </div>
                        </div>
                        {/* Scanline / Ticker */}
                        <div className="bg-black/20 overflow-hidden py-1">
                            <motion.div
                                animate={{ x: ["100%", "-100%"] }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="whitespace-nowrap font-mono text-xs text-red-100/80"
                            >
                                ⚠️ URGENT: FLOODING REPORTED ON 5TH AVE • DEPLOYING SANDBAG SQUAD • 3 MEDIC UNITS EN ROUTE • MEDIC TRUCK ARRIVING IN 2 MINS • ALL CIVILIANS ADVISE CAUTION •
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Bottom Floating Action Card */}
                    <motion.div
                        initial={{ y: 200, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 200, opacity: 0 }}
                        className="fixed bottom-8 left-0 right-0 z-[100] pointer-events-none flex justify-center px-4"
                    >
                        <div className="bg-slate-900/90 backdrop-blur-xl border border-red-500/50 p-6 rounded-2xl shadow-2xl max-w-lg w-full pointer-events-auto text-white">
                            <div className="flex items-start gap-4">
                                <div className="bg-red-500/20 p-3 rounded-xl border border-red-500/30">
                                    <ShieldAlert className="w-8 h-8 text-red-500" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-white mb-1 flex items-center gap-2">
                                        Mission Critical
                                        <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                                            3x Impact
                                        </span>
                                    </h3>
                                    <p className="text-sm text-slate-300 mb-4">
                                        Flash flood warning. Seniors in sector 7 need evacuation assistance.
                                    </p>
                                    <button className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/50 group">
                                        <span>Accept Deployment</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SwarmOverlay;
