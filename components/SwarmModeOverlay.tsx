import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Users, Clock, MapPin, Phone, Navigation, Heart, Shield } from 'lucide-react';
import { Mission } from '../types';
import { Button, Badge } from './index';

interface SwarmModeOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    emergencyMissions: Mission[];
    onAcceptMission: (missionId: string) => void;
}

const SwarmModeOverlay: React.FC<SwarmModeOverlayProps> = ({
    isOpen,
    onClose,
    emergencyMissions,
    onAcceptMission
}) => {
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [activeResponders, setActiveResponders] = useState(0);

    useEffect(() => {
        if (!isOpen) {
            setTimeElapsed(0);
            return;
        }

        // Simulate active responders
        setActiveResponders(Math.floor(Math.random() * 8) + 3);

        // Timer
        const interval = setInterval(() => {
            setTimeElapsed(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen]);

    if (!isOpen) return null;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900 overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-br from-error via-primary to-warning animate-pulse" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-0" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)',
                }} />
            </div>

            {/* Alert stripe animation */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-error via-warning to-error animate-pulse" style={{ animationDuration: '1.5s' }} />

            {/* Header */}
            <div className="relative z-10 p-6 border-b border-error/30 bg-slate-900/90 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Pulsing alert icon */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-error rounded-full animate-ping opacity-75" />
                            <div className="relative bg-error rounded-full p-3">
                                <AlertTriangle className="w-8 h-8 text-white" fill="currentColor" />
                            </div>
                        </div>

                        <div>
                            <h1 className="text-3xl font-heading font-bold text-white flex items-center gap-3">
                                SWARM MODE ACTIVE
                                <Badge variant="urgent" className="animate-pulse">
                                    LIVE
                                </Badge>
                            </h1>
                            <p className="text-error-light mt-1">
                                Emergency response coordinated • {emergencyMissions.length} critical mission{emergencyMissions.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-white/10 rounded-full transition-colors text-white group"
                    >
                        <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>
            </div>

            {/* Stats bar */}
            <div className="relative z-10 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="grid grid-cols-3 gap-6">
                        {/* Time elapsed */}
                        <div className="flex items-center gap-3">
                            <Clock className="w-6 h-6 text-warning" />
                            <div>
                                <p className="text-slate-400 text-xs uppercase font-bold">Time Elapsed</p>
                                <p className="text-white text-2xl font-heading">{formatTime(timeElapsed)}</p>
                            </div>
                        </div>

                        {/* Active responders */}
                        <div className="flex items-center gap-3">
                            <Users className="w-6 h-6 text-cta" />
                            <div>
                                <p className="text-slate-400 text-xs uppercase font-bold">Active Responders</p>
                                <p className="text-white text-2xl font-heading">{activeResponders}</p>
                            </div>
                        </div>

                        {/* Priority level */}
                        <div className="flex items-center gap-3">
                            <Shield className="w-6 h-6 text-error" />
                            <div>
                                <p className="text-slate-400 text-xs uppercase font-bold">Priority Level</p>
                                <p className="text-error text-2xl font-heading">CRITICAL</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mission grid */}
            <div className="relative z-10 p-6 overflow-y-auto h-[calc(100vh-240px)]">
                <div className="max-w-7xl mx-auto">
                    {emergencyMissions.length === 0 ? (
                        <div className="text-center py-16">
                            <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">All Clear</h3>
                            <p className="text-slate-400">No emergency missions at this time</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            {emergencyMissions.map((mission, index) => (
                                <div
                                    key={mission.id}
                                    className="bg-slate-800 border-2 border-error/30 rounded-2xl p-6 hover:border-error/60 transition-all transform hover:scale-[1.02] animate-in slide-in-from-bottom duration-300"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Mission header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <Badge variant="urgent" className="mb-2">
                                                URGENT
                                            </Badge>
                                            <h3 className="text-xl font-heading text-white mb-1">
                                                {mission.title}
                                            </h3>
                                        </div>
                                        <div className="bg-error/20 p-2 rounded-lg">
                                            {mission.type === 'MEDICAL_NEED' ? (
                                                <Heart className="w-6 h-6 text-error" />
                                            ) : (
                                                <AlertTriangle className="w-6 h-6 text-warning" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                                        {mission.description}
                                    </p>

                                    {/* Location & distance */}
                                    <div className="flex items-center gap-4 mb-4 text-sm">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <MapPin className="w-4 h-4" />
                                            <span className="truncate">{mission.location?.address || 'Location unavailable'}</span>
                                        </div>
                                    </div>

                                    {/* Agent info if assigned */}
                                    {mission.agentBio && (
                                        <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
                                            <p className="text-xs text-slate-400 mb-1">Marathon Agent</p>
                                            <p className="text-sm text-white font-bold">{mission.agentBio.name}</p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <Button
                                            variant="emergency"
                                            onClick={() => onAcceptMission(mission.id)}
                                            className="flex-1"
                                        >
                                            <Navigation className="w-4 h-4" />
                                            Respond Now
                                        </Button>
                                        {mission.requesterPhone && (
                                            <Button
                                                variant="secondary"
                                                onClick={() => window.location.href = `tel:${mission.requesterPhone}`}
                                                className="px-4"
                                            >
                                                <Phone className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SwarmModeOverlay;
