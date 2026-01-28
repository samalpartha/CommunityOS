import React from 'react';
import { Flame, Zap } from 'lucide-react';

interface StreakCounterProps {
    days: number;
    variant?: 'compact' | 'full';
    showEffects?: boolean;
}

const StreakCounter: React.FC<StreakCounterProps> = ({
    days,
    variant = 'compact',
    showEffects = true
}) => {
    // Determine streak tier for effects
    const getStreakTier = () => {
        if (days >= 30) return 'legendary';
        if (days >= 14) return 'epic';
        if (days >= 7) return 'hot';
        if (days >= 3) return 'warming';
        return 'new';
    };

    const tier = getStreakTier();

    // Tier styling
    const getTierStyles = () => {
        switch (tier) {
            case 'legendary':
                return {
                    bg: 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500',
                    text: 'text-white',
                    glow: 'shadow-2xl shadow-purple-500/50',
                    particles: 3,
                };
            case 'epic':
                return {
                    bg: 'bg-gradient-to-r from-orange-500 to-rose-500',
                    text: 'text-white',
                    glow: 'shadow-xl shadow-orange-500/40',
                    particles: 2,
                };
            case 'hot':
                return {
                    bg: 'bg-gradient-to-r from-yellow-400 to-orange-500',
                    text: 'text-white',
                    glow: 'shadow-lg shadow-orange-400/30',
                    particles: 1,
                };
            case 'warming':
                return {
                    bg: 'bg-gradient-to-r from-rose-400 to-orange-400',
                    text: 'text-white',
                    glow: 'shadow-md shadow-rose-300/20',
                    particles: 0,
                };
            default:
                return {
                    bg: 'bg-slate-100 dark:bg-slate-800',
                    text: 'text-slate-600 dark:text-slate-300',
                    glow: '',
                    particles: 0,
                };
        }
    };

    const styles = getTierStyles();

    if (variant === 'compact') {
        return (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${styles.bg} ${styles.glow} relative overflow-hidden`}>
                {/* Animated particles */}
                {showEffects && styles.particles > 0 && (
                    <>
                        {[...Array(styles.particles)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-ping"
                                style={{
                                    left: `${20 + i * 30}%`,
                                    animationDelay: `${i * 0.3}s`,
                                    animationDuration: '1.5s',
                                }}
                            />
                        ))}
                    </>
                )}

                {/* Flame icon with animation */}
                <Flame
                    className={`w-4 h-4 ${styles.text} ${tier !== 'new' && showEffects ? 'animate-pulse' : ''}`}
                    fill={tier !== 'new' ? 'currentColor' : 'none'}
                />

                {/* Streak count */}
                <span className={`font-heading font-bold text-sm ${styles.text}`}>
                    {days}
                </span>
            </div>
        );
    }

    // Full variant with more details
    return (
        <div className={`rounded-2xl p-6 ${styles.bg} ${styles.glow} relative overflow-hidden`}>
            {/* Background effects */}
            {showEffects && tier !== 'new' && (
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/30 to-transparent animate-pulse" />
                </div>
            )}

            {/* Floating particles for legendary tier */}
            {showEffects && tier === 'legendary' && (
                <>
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 bg-yellow-200 rounded-full"
                            style={{
                                left: `${10 + i * 15}%`,
                                bottom: '-10%',
                                animation: `float-up ${2 + i * 0.5}s ease-in-out infinite`,
                                animationDelay: `${i * 0.4}s`,
                            }}
                        />
                    ))}
                </>
            )}

            <div className="relative z-10 text-center">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="relative">
                        <Flame
                            className={`w-16 h-16 ${styles.text}`}
                            fill="currentColor"
                        />
                        {tier === 'legendary' && showEffects && (
                            <Zap
                                className="absolute top-0 left-0 w-16 h-16 text-yellow-200 animate-ping"
                                style={{ animationDuration: '2s' }}
                            />
                        )}
                    </div>
                </div>

                {/* Streak count */}
                <div className={`font-heading font-bold text-6xl mb-2 ${styles.text}`}>
                    {days}
                </div>

                {/* Label */}
                <div className={`text-lg font-bold uppercase tracking-wider ${styles.text} opacity-90`}>
                    Day Streak
                </div>

                {/* Tier badge */}
                {tier !== 'new' && (
                    <div className={`mt-4 inline-block px-4 py-1 rounded-full bg-black/20 backdrop-blur-sm ${styles.text} text-sm font-bold uppercase`}>
                        {tier === 'legendary' && '🏆 Legendary'}
                        {tier === 'epic' && '⚡ Epic'}
                        {tier === 'hot' && '🔥 On Fire'}
                        {tier === 'warming' && '💪 Getting Hot'}
                    </div>
                )}

                {/* Next milestone */}
                {days < 30 && (
                    <div className={`mt-4 text-sm ${styles.text} opacity-75`}>
                        {days < 3 && `${3 - days} more day${3 - days > 1 ? 's' : ''} to Warming`}
                        {days >= 3 && days < 7 && `${7 - days} more day${7 - days > 1 ? 's' : ''} to Hot`}
                        {days >= 7 && days < 14 && `${14 - days} more day${14 - days > 1 ? 's' : ''} to Epic`}
                        {days >= 14 && days < 30 && `${30 - days} more day${30 - days > 1 ? 's' : ''} to Legendary`}
                    </div>
                )}
            </div>

            {/* Add keyframes for float animation */}
            <style>{`
                @keyframes float-up {
                    0% {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.8;
                    }
                    100% {
                        transform: translateY(-200%) scale(0);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default StreakCounter;
