import React, { useEffect, useState } from 'react';
import { Trophy, Star, Zap, Sparkles, X } from 'lucide-react';
import { Button } from './index';

interface LevelUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    newLevel: number;
    xpEarned: number;
    rewards?: string[];
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({
    isOpen,
    onClose,
    newLevel,
    xpEarned,
    rewards = []
}) => {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShowConfetti(true);
            // Auto-hide confetti after animation
            const timer = setTimeout(() => setShowConfetti(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-500">
            {/* Confetti particles */}
            {showConfetti && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(30)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: '-10%',
                                backgroundColor: ['#E11D48', '#FB7185', '#2563EB', '#60A5FA', '#FBBF24', '#10B981'][Math.floor(Math.random() * 6)],
                                animation: `confetti-fall ${2 + Math.random() * 2}s ease-out forwards`,
                                animationDelay: `${Math.random() * 0.5}s`,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Modal */}
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Gradient header */}
                <div className="relative bg-gradient-to-br from-primary via-rose-500 to-yellow-500 p-12 text-center overflow-hidden">
                    {/* Animated rings */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 border-4 border-white/30 rounded-full animate-ping" />
                        <div className="absolute w-48 h-48 border-4 border-white/20 rounded-full animate-pulse" style={{ animationDuration: '2s' }} />
                    </div>

                    {/* Trophy icon */}
                    <div className="relative z-10 mb-4 flex justify-center">
                        <div className="bg-white/20 backdrop-blur-sm p-6 rounded-full">
                            <Trophy className="w-16 h-16 text-yellow-300 animate-bounce" fill="currentColor" />
                        </div>
                    </div>

                    {/* Level number */}
                    <div className="relative z-10">
                        <h2 className="text-6xl font-heading font-bold text-white mb-2 animate-in zoom-in duration-500">
                            {newLevel}
                        </h2>
                        <p className="text-xl font-bold text-white/90 uppercase tracking-wider">
                            Level Unlocked!
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 text-center">
                    {/* XP earned */}
                    <div className="mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-full">
                            <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" />
                            <span className="font-heading font-bold text-yellow-800 dark:text-yellow-300">
                                +{xpEarned} XP Earned
                            </span>
                        </div>
                    </div>

                    {/* Rewards */}
                    {rewards.length > 0 && (
                        <div className="mb-6 space-y-3">
                            <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                New Rewards Unlocked
                            </h3>
                            <div className="space-y-2">
                                {rewards.map((reward, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl animate-in slide-in-from-left duration-300"
                                        style={{ animationDelay: `${i * 100}ms` }}
                                    >
                                        <Star className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" />
                                        <span className="text-sm text-slate-700 dark:text-slate-300 text-left">
                                            {reward}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Encouragement message */}
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        You're making an incredible impact in your community! Keep going, hero! 🚀
                    </p>

                    {/* CTA */}
                    <Button
                        variant="primary"
                        onClick={onClose}
                        className="w-full"
                    >
                        Continue Mission
                    </Button>
                </div>
            </div>

            {/* Keyframes for confetti */}
            <style>{`
                @keyframes confetti-fall {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(110vh) rotate(720deg);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default LevelUpModal;
