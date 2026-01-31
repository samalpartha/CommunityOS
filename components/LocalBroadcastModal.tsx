import React, { useState, useContext } from 'react';
import { X, Radio, AlertTriangle, Package, Info, MapPin } from 'lucide-react';
import { LocalBroadcast } from '../types';

interface LocalBroadcastModalProps {
    onClose: () => void;
    onSend: (broadcast: Omit<LocalBroadcast, 'id' | 'timestamp' | 'expiresAt' | 'hopCount'>) => void;
    meshSignalStrength: number;
    userName: string;
    userId: string;
}

const BROADCAST_TEMPLATES = [
    { type: 'HELP_NEEDED' as const, label: '🆘 Need Help', color: 'red', sample: 'Urgent assistance needed at my location' },
    { type: 'RESOURCE_AVAILABLE' as const, label: '📦 Resource Available', color: 'green', sample: 'Have supplies available to share' },
    { type: 'HAZARD_ALERT' as const, label: '⚠️ Hazard Alert', color: 'orange', sample: 'Warning: hazard detected in area' },
    { type: 'GENERAL' as const, label: '💬 General Message', color: 'blue', sample: 'General information for nearby community' }
];

const CHARACTER_LIMIT = 256;

export default function LocalBroadcastModal({ onClose, onSend, meshSignalStrength, userName, userId }: LocalBroadcastModalProps) {
    const [selectedType, setSelectedType] = useState<LocalBroadcast['type']>('GENERAL');
    const [message, setMessage] = useState('');
    const [includeLocation, setIncludeLocation] = useState(true);
    const [meshOnly, setMeshOnly] = useState(true);

    const selectedTemplate = BROADCAST_TEMPLATES.find(t => t.type === selectedType);
    const charsRemaining = CHARACTER_LIMIT - message.length;

    // Estimate mesh reach based on signal strength (mock calculation)
    const estimatedReachKm = (meshSignalStrength / 100) * 2; // 0-2km range

    const handleSend = () => {
        if (message.trim().length === 0) return;

        const broadcast: Omit<LocalBroadcast, 'id' | 'timestamp' | 'expiresAt' | 'hopCount'> = {
            message: message.trim(),
            type: selectedType,
            location: includeLocation ? { lat: 40.7128, lng: -74.0060 } : undefined, // Mock location
            sender: {
                id: userId,
                name: userName,
                trustScore: 85 // Mock
            }
        };

        onSend(broadcast);
        onClose();
    };

    const loadTemplate = (type: typeof selectedType) => {
        const template = BROADCAST_TEMPLATES.find(t => t.type === type);
        if (template) {
            setMessage(template.sample);
            setSelectedType(type);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-500 p-4 flex items-center justify-between rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <Radio className="w-5 h-5 text-white animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Local Mesh Broadcast</h2>
                            <p className="text-xs text-white/80">Emergency mesh-only message</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Signal Strength Indicator */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Mesh Signal</span>
                            <span className="text-sm font-bold text-emerald-600">{meshSignalStrength}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-emerald-500 to-green-400 h-full transition-all duration-300"
                                style={{ width: `${meshSignalStrength}%` }}
                            />
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                            <MapPin className="w-3 h-3" />
                            <span>Est. reach: ~{estimatedReachKm.toFixed(1)}km radius</span>
                        </div>
                    </div>

                    {/* Message Type Templates */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Message Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {BROADCAST_TEMPLATES.map(template => (
                                <button
                                    key={template.type}
                                    onClick={() => loadTemplate(template.type)}
                                    className={`p-3 rounded-xl text-left transition-all border-2 ${selectedType === template.type
                                            ? `border-${template.color}-500 bg-${template.color}-50 dark:bg-${template.color}-900/20`
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="text-sm font-bold">{template.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message Input */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase">Message</label>
                            <span className={`text-xs font-mono ${charsRemaining < 50 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                                {charsRemaining}/{CHARACTER_LIMIT}
                            </span>
                        </div>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value.slice(0, CHARACTER_LIMIT))}
                            placeholder="Type your emergency message..."
                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none focus:ring-2 focus:ring-amber-500 outline-none dark:text-white"
                            rows={4}
                            maxLength={CHARACTER_LIMIT}
                        />
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={includeLocation}
                                onChange={(e) => setIncludeLocation(e.target.checked)}
                                className="w-5 h-5 text-amber-600 border-slate-300 rounded focus:ring-amber-500"
                            />
                            <div className="flex-1">
                                <div className="text-sm font-medium dark:text-white">Include My Location</div>
                                <div className="text-xs text-slate-500">Help responders find you faster</div>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={meshOnly}
                                onChange={(e) => setMeshOnly(e.target.checked)}
                                className="w-5 h-5 text-amber-600 border-slate-300 rounded focus:ring-amber-500"
                            />
                            <div className="flex-1">
                                <div className="text-sm font-medium dark:text-white">Mesh Only (No Internet)</div>
                                <div className="text-xs text-slate-500">Message stays on local network</div>
                            </div>
                        </label>
                    </div>

                    {/* Info Alert */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 flex gap-2">
                        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                            This message will only reach nearby mesh nodes. It won't sync to the cloud until internet is restored.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={message.trim().length === 0}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Radio className="w-4 h-4" />
                            Broadcast to Mesh
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
