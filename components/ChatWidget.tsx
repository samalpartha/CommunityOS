import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { MessageCircle, X, Send, MinusSquare, Maximize2 } from 'lucide-react';
import { ChatManager } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatWidgetProps {
    onNavigate: (tab: string) => void;
    onSearchMissions: (query: string) => void;
}

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'error';
    text: string;
    timestamp: Date;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ onNavigate, onSearchMissions }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            text: "Hi! Need help finding a mission?",
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const chatManagerRef = useRef<ChatManager | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatManagerRef.current = new ChatManager();
    }, []);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen, isTyping]);


    const processUserIntent = (text: string) => {
        const lowerText = text.toLowerCase();

        if (lowerText.includes('mission') || lowerText.includes('cleanup')) {
            setTimeout(() => {
                setIsTyping(false);
                addMessage('assistant', "I found some cleanup missions for you!");
                onSearchMissions('cleanup');
            }, 1000);
            return true;
        }

        if (lowerText.includes('report') || lowerText.includes('broken')) {
            setTimeout(() => {
                onNavigate('HOME');
            }, 1000);
            return true;
        }

        return false;
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userText = inputValue.trim();
        setInputValue('');

        addMessage('user', userText);
        setIsTyping(true);

        const handled = processUserIntent(userText);
        if (handled) return;

        if (chatManagerRef.current) {
            const response = await chatManagerRef.current.sendMessage(userText);
            setIsTyping(false);
            addMessage('assistant', response);
        } else {
            setIsTyping(false);
            addMessage('error', "Chat service unavailable.");
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSendMessage();
    };

    const addMessage = (role: Message['role'], text: string) => {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role,
            text,
            timestamp: new Date()
        }]);
    };

    return (
        <div className="fixed bottom-20 right-4 md:bottom-4 md:right-6 z-[9990] flex flex-col items-end font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white dark:bg-slate-800 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-700 w-80 md:w-96 overflow-hidden mb-4 flex flex-col h-[500px]"
                    >
                        {/* Header */}
                        <div className="bg-indigo-600 p-4 flex items-center justify-between text-white shrink-0">
                            <h3 className="font-bold flex items-center gap-2">
                                <MessageCircle className="w-5 h-5" />
                                Community Assistant
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-indigo-700 p-1 rounded">
                                <MinusSquare className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`
                                        max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm
                                        ${msg.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-br-none'
                                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-none'
                                        }
                                    `}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shrink-0 flex gap-2">
                            <input
                                className="flex-1 bg-slate-100 dark:bg-slate-900 border-none outline-none rounded-full px-4 py-2 text-sm text-slate-800 dark:text-white"
                                placeholder="Type a message..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <button
                                onClick={handleSendMessage}
                                className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 group relative"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}

                {/* Notification Badge (Fake for now) */}
                {!isOpen && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
                )}
            </button>
        </div>
    );
};

export default ChatWidget;
