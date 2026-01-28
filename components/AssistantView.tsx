import React, { useState, useRef, useEffect } from 'react';
import { Mic, ChevronDown } from 'lucide-react';
import { LiveSession } from '../services/geminiService';
import { Mission } from '../types';
import { AnimatePresence, motion } from 'framer-motion';

interface AssistantViewProps {
    missions: Mission[];
    onNavigate: (tab: string) => void;
    onSearchMissions: (query: string) => void;
}

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'error';
    text: string;
    timestamp: Date;
}

const AssistantView: React.FC<AssistantViewProps> = ({ missions, onNavigate, onSearchMissions }) => {
    // Mode State
    const [isVoiceActive, setIsVoiceActive] = useState(false);

    // Transcript State (formerly messages)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            text: "Tap the microphone to start speaking.",
            timestamp: new Date()
        }
    ]);

    // Services
    const liveSessionRef = useRef<LiveSession | null>(null);

    // UI Refs
    const requestRef = useRef<number>();

    // Audio Visualization State
    const [audioLevels, setAudioLevels] = useState<number[]>(new Array(20).fill(0.1));

    // --- COMMAND HANDLING ---
    const processUserIntent = (text: string) => {
        const lowerText = text.toLowerCase();

        // Command: Search Missions
        if (lowerText.includes('mission') || lowerText.includes('cleanup') || lowerText.includes('trash')) {
            setTimeout(() => {
                onSearchMissions('cleanup');
            }, 1500); // Slight delay to let the AI finish its sentence
            return true;
        }

        // Command: Report / Camera
        if (lowerText.includes('report') || lowerText.includes('broken') || lowerText.includes('fix')) {
            setTimeout(() => {
                onNavigate('HOME');
            }, 1500);
            return true;
        }

        return false;
    };

    const addMessage = (role: Message['role'], text: string) => {
        setMessages(prev => {
            // Keep only last 3 messages for transcript focus
            const newMsgs = [...prev, {
                id: Date.now().toString(),
                role,
                text,
                timestamp: new Date()
            }];
            return newMsgs.slice(-3);
        });
    };



    // --- VOICE HANDLERS ---

    const stopVoiceMode = () => {
        setIsVoiceActive(false);
        if (liveSessionRef.current) {
            liveSessionRef.current.disconnect();
            liveSessionRef.current = null;
        }
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }
        setAudioLevels(new Array(20).fill(0.1));
    };

    const startVoiceMode = async () => {
        setIsVoiceActive(true);
        // Visualizer placeholder until data flows
        animateWaveform();

        try {
            if (!liveSessionRef.current) {
                liveSessionRef.current = new LiveSession();
            }

            await liveSessionRef.current.connect(
                (status, err) => {
                    if (status === 'error' || status === 'quota_exceeded' || status === 'rate_limit') {
                        stopVoiceMode();
                        addMessage('error', err || "Voice connection failed.");
                    } else if (status === 'disconnected') {
                        stopVoiceMode();
                    }
                },
                'BLIND_SUPPORT',
                (speaker, text) => {
                    // For voice mode, we append to chat too!
                    if (speaker === 'assistant') {
                        addMessage('assistant', text);
                    } else if (speaker === 'user') {
                        addMessage('user', text);
                        // TRIGGER COMMAND PARSING FOR VOICE
                        processUserIntent(text);
                    }
                }
            );
        } catch (err: any) {
            console.error("Voice Connect error", err);
            stopVoiceMode();
            addMessage('error', err.message || "Failed to initialize voice.");
        }
    };

    const toggleVoiceMode = () => {
        if (isVoiceActive) {
            stopVoiceMode();
        } else {
            startVoiceMode();
        }
    };

    // --- VISUALIZER ---
    const animateWaveform = () => {
        if (!isVoiceActive) return;

        if (liveSessionRef.current) {
            const data = liveSessionRef.current.getAudioData();
            if (data) {
                // We want 20 bars
                const step = Math.floor(data.length / 20);
                const levels: number[] = [];
                for (let i = 0; i < 20; i++) {
                    const val = data[i * step] || 0;
                    levels.push(Math.max(0.1, val / 255));
                }
                setAudioLevels(levels);
            }
        } else {
            // Idle animation while connecting
            const time = Date.now() / 200;
            const newLevels = new Array(20).fill(0).map((_, i) => {
                return 0.2 + (Math.sin(time + i * 0.5) * 0.1);
            });
            setAudioLevels(newLevels);
        }

        requestRef.current = requestAnimationFrame(animateWaveform);
    };

    useEffect(() => {
        if (isVoiceActive) {
            requestRef.current = requestAnimationFrame(animateWaveform);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isVoiceActive]);

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col relative overflow-hidden transition-colors items-center justify-center p-6">

            {/* Background Ambience */}
            <div className={`absolute inset-0 bg-gradient-to-b from-slate-900 to-indigo-950 transition-opacity duration-1000 ${isVoiceActive ? 'opacity-100' : 'opacity-50'}`} />

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 text-white/50">
                <button onClick={() => onNavigate('HOME')} className="hover:text-white transition-colors">
                    <ChevronDown className="w-8 h-8 rotate-90" />
                </button>
                <div className="flex gap-2">
                    <div className={`w-2 h-2 rounded-full ${isVoiceActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-xs font-mono uppercase tracking-widest">{isVoiceActive ? 'LIVE SESSION' : 'OFFLINE'}</span>
                </div>
            </div>


            {/* Main Visualizer */}
            <div className="relative z-10 flex flex-col items-center gap-12 max-w-lg w-full">

                {/* Transcript Area */}
                <div className="h-48 w-full flex flex-col items-center justify-end space-y-4 text-center">
                    <AnimatePresence mode="popLayout">
                        {messages.slice(-2).map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`text-2xl md:text-3xl font-medium leading-relaxed
                                    ${msg.role === 'assistant' ? 'text-indigo-200' : 'text-white'}
                                    ${msg.role === 'error' ? 'text-red-400 text-lg' : ''}
                                `}
                            >
                                {msg.role === 'user' ? (
                                    <span className="opacity-70">"{msg.text}"</span>
                                ) : (
                                    msg.text
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Orb / Visualizer */}
                <div
                    onClick={toggleVoiceMode}
                    className="relative cursor-pointer group"
                >
                    {/* Ring 1 */}
                    <div className={`absolute inset-0 rounded-full border-2 border-indigo-500/30 transition-all duration-300
                        ${isVoiceActive ? 'scale-150 opacity-100 animate-[spin_10s_linear_infinite]' : 'scale-100 opacity-20'}`}
                    />

                    {/* Ring 2 */}
                    <div className={`absolute inset-0 rounded-full border border-indigo-300/20 transition-all duration-300 delay-75
                        ${isVoiceActive ? 'scale-[1.8] opacity-100 animate-[pulse_3s_ease-in-out_infinite]' : 'scale-90 opacity-10'}`}
                    />

                    {/* Core Button */}
                    <div className={`
                        w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 relative z-20
                        ${isVoiceActive
                            ? 'bg-gradient-to-br from-red-500 to-pink-600 shadow-red-500/50 scale-110'
                            : 'bg-gradient-to-br from-indigo-600 to-blue-700 shadow-indigo-500/30 hover:scale-105'
                        }
                    `}>
                        {isVoiceActive ? (
                            <div className="flex gap-1 h-8 items-center">
                                {/* Dynamic Bar Visualizer Inside Button */}
                                {audioLevels.slice(0, 5).map((l, i) => (
                                    <div key={i} className="w-1 bg-white rounded-full animate-pulse"
                                        style={{ height: `${Math.max(8, l * 40)}px` }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <Mic className="w-10 h-10 text-white" />
                        )}
                    </div>

                    <p className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white/40 text-sm font-medium tracking-widest whitespace-nowrap group-hover:text-white/80 transition-colors">
                        {isVoiceActive ? 'TAP TO STOP' : 'TAP TO SPEAK'}
                    </p>
                </div>

            </div>
        </div>
    );
};

export default AssistantView;
