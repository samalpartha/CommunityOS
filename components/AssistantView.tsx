import React, { useState, useRef, useEffect } from 'react';
import { Mic, ChevronDown } from 'lucide-react';
import { voiceManager } from '../services/geminiService';
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
    const [voiceStatus, setVoiceStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>(() => {
        const s = voiceManager.getStatus();
        return s === 'disconnected' ? 'idle' : s as any;
    });

    // Transcript State
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            text: "Tap the microphone to start speaking.",
            timestamp: new Date()
        }
    ]);

    // Audio Visualization State
    const [audioLevels, setAudioLevels] = useState<number[]>(new Array(20).fill(0.1));
    const animationFrameRef = useRef<number | null>(null);

    // --- COMMAND HANDLING ---
    useEffect(() => {
        console.log("🧩 AssistantView Mounted");

        const unsubscribe = voiceManager.onStatusChange((status, err) => {
            console.log("📡 AssistantView received status update:", status);
            const uiStatus = status === 'disconnected' ? 'idle' : status as any;
            setVoiceStatus(uiStatus);
            setIsVoiceActive(status === 'connected');

            if (status === 'error' && err) {
                addMessage('error', err);
            }
        });

        return () => {
            console.warn("🧩 AssistantView Unmounted");
            unsubscribe();
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    const addMessage = (role: Message['role'], text: string) => {
        setMessages(prev => {
            const newMsgs = [...prev, {
                id: Date.now().toString(),
                role,
                text,
                timestamp: new Date()
            }].slice(-3);
            return newMsgs;
        });
    };

    const processUserIntent = (text: string) => {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('mission') || lowerText.includes('cleanup') || lowerText.includes('trash')) {
            setTimeout(() => onSearchMissions('cleanup'), 1500);
            return true;
        }
        return false;
    };

    // --- VOICE HANDLERS ---
    const startVoiceMode = async () => {
        if (voiceStatus === 'connecting' || voiceStatus === 'connected') return;

        console.log("🛠 startVoiceMode (VoiceManager)");
        setMessages([]); // Clear transcript for new session

        try {
            await voiceManager.connect('BLIND_SUPPORT', (speaker, text) => {
                addMessage(speaker, text);
                if (speaker === 'user') processUserIntent(text);
            });
        } catch (err: any) {
            console.error("❌ startVoiceMode error:", err);
            addMessage('error', "Failed to connect voice.");
        }
    };

    const stopVoiceMode = () => {
        console.log("🛠 stopVoiceMode (VoiceManager)");
        voiceManager.disconnect();
    };

    const toggleVoiceMode = () => {
        if (voiceStatus === 'connecting') return;
        if (isVoiceActive || voiceStatus === 'connected') {
            stopVoiceMode();
        } else {
            startVoiceMode();
        }
    };

    // --- VISUALIZER ---
    const animateWaveform = () => {
        if (voiceManager.getStatus() === 'connected') {
            const data = voiceManager.getAudioData();
            if (data) {
                const levels = Array.from(data).slice(0, 20).map(v => v / 255);
                setAudioLevels(levels);
            }
        } else {
            setAudioLevels(prev => prev.map(l => 0.1 + Math.random() * 0.05));
        }
        animationFrameRef.current = requestAnimationFrame(animateWaveform);
    };

    useEffect(() => {
        animationFrameRef.current = requestAnimationFrame(animateWaveform);
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col relative overflow-hidden transition-colors items-center justify-center p-6">
            <div className={`absolute inset-0 bg-gradient-to-b from-slate-900 to-indigo-950 transition-opacity duration-1000 ${isVoiceActive ? 'opacity-100' : 'opacity-50'}`} />

            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 text-white/50">
                <button onClick={() => onNavigate('HOME')} className="hover:text-white transition-colors">
                    <ChevronDown className="w-8 h-8 rotate-90" />
                </button>
                <div className="flex gap-2">
                    <div className={`w-2 h-2 rounded-full ${isVoiceActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-xs font-mono uppercase tracking-widest">{isVoiceActive ? 'LIVE SESSION' : 'OFFLINE'}</span>
                </div>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-12 max-w-lg w-full">
                <div className="h-48 w-full flex flex-col items-center justify-end space-y-4 text-center">
                    <AnimatePresence mode="popLayout">
                        {messages.map((msg) => (
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
                                {msg.role === 'user' ? <span className="opacity-70">"{msg.text}"</span> : msg.text}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <div onClick={toggleVoiceMode} className="relative cursor-pointer group">
                    <div className={`absolute inset-0 rounded-full border-2 border-indigo-500/30 transition-all duration-300
                        ${isVoiceActive ? 'scale-150 opacity-100 animate-[spin_10s_linear_infinite]' : 'scale-100 opacity-20'}`}
                    />
                    <div className={`absolute inset-0 rounded-full border border-indigo-300/20 transition-all duration-300 delay-75
                        ${isVoiceActive ? 'scale-[1.8] opacity-100 animate-[pulse_3s_ease-in-out_infinite]' : 'scale-90 opacity-10'}`}
                    />
                    <div className={`
                        w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 relative z-20
                        ${isVoiceActive
                            ? 'bg-gradient-to-br from-red-500 to-pink-600 shadow-red-500/50 scale-110'
                            : 'bg-gradient-to-br from-indigo-600 to-blue-700 shadow-indigo-500/30 hover:scale-105'
                        }
                    `}>
                        {isVoiceActive ? (
                            <div className="flex gap-1 h-8 items-center">
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
                        {isVoiceActive ? 'TAP TO STOP' : (voiceStatus === 'connecting' ? 'CONNECTING...' : 'TAP TO SPEAK')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AssistantView;
