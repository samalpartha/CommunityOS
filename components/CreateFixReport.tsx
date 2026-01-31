import React, { useState } from 'react';
import { Camera, X, Sparkles, AlertTriangle, BrainCircuit } from 'lucide-react';
import { analyzeFixImage } from '../services/geminiService';
import { MissionType } from '../types';
import { FixAnalysis } from '../services/geminiService';

interface CreateFixReportProps {
    onClose: () => void;
    onSubmit: (report: any) => void;
    // Strategic Track: Marathon Agent
    isMarathonMode?: boolean;
    onMarathonGoal?: (goal: string) => void;
}

const CreateFixReport: React.FC<CreateFixReportProps> = ({ onClose, onSubmit, isMarathonMode, onMarathonGoal }) => {
    const [activeTab, setActiveTab] = useState<'ONE_TAP' | 'MARATHON'>('ONE_TAP');
    const [image, setImage] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [report, setReport] = useState<FixAnalysis | null>(null);
    const [marathonGoal, setMarathonGoal] = useState('');

    const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAnalyzing(true);
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                setImage(base64);
                try {
                    const result = await analyzeFixImage(base64.split(',')[1]);
                    setReport(result);
                } catch (err) {
                    console.error(err);
                } finally {
                    setAnalyzing(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if (report && image) {
            onSubmit({
                id: `new-${Date.now()}`,
                type: MissionType.FIX_BOUNTY,
                title: report.category,
                description: report.description,
                location: 'Current Location',
                distance: '0.0 mi',
                reward: 50,
                status: 'OPEN',
                urgency: report.severity === 'High' ? 'HIGH' : 'MEDIUM',
                timeEstimate: '10 min',
                fixData: {
                    severity: report.severity,
                    imageUrl: image
                }
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col animate-in fade-in duration-200">
            <div className="p-4 flex justify-between items-center text-white">
                <h2 className="font-bold text-lg">Create Mission</h2>
                <button onClick={onClose}><X className="w-6 h-6" /></button>
            </div>

            <div className="flex justify-center gap-4 mb-4">
                <button
                    onClick={() => setActiveTab('ONE_TAP')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${activeTab === 'ONE_TAP' ? 'bg-white text-black' : 'bg-white/10 text-white'}`}
                >
                    One-Tap Fix
                </button>
                <button
                    onClick={() => setActiveTab('MARATHON')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-colors flex items-center gap-2 ${activeTab === 'MARATHON' ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white'}`}
                >
                    <BrainCircuit className="w-3 h-3" /> Marathon Agent
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto">
                {activeTab === 'MARATHON' ? (
                    <div className="w-full bg-slate-900 border border-slate-700 p-6 rounded-2xl">
                        <h3 className="text-white font-bold text-xl mb-2">Marathon Planning</h3>
                        <p className="text-slate-400 text-sm mb-4">Describe a complex community goal. Gemini will break it down into actionable missions for volunteers.</p>

                        <textarea
                            value={marathonGoal}
                            onChange={(e) => setMarathonGoal(e.target.value)}
                            placeholder="e.g., Organize a cleanup for the river bank including trash collection, sorting recyclables, and safety checks..."
                            className="w-full bg-black/30 border border-slate-600 rounded-xl p-4 text-white placeholder-slate-500 mb-4 focus:outline-none focus:border-indigo-500"
                            rows={4}
                        />

                        <button
                            onClick={() => onMarathonGoal && onMarathonGoal(marathonGoal)}
                            disabled={!marathonGoal || isMarathonMode}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isMarathonMode ? <Sparkles className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
                            {isMarathonMode ? 'Thinking...' : 'Generate Plan'}
                        </button>
                    </div>
                ) : !image ? (
                    <label className="w-full h-full border-2 border-dashed border-white border-opacity-30 rounded-2xl flex flex-col items-center justify-center cursor-pointer active:bg-white active:bg-opacity-10 transition-colors">
                        <Camera className="w-16 h-16 text-white mb-4" />
                        <span className="text-white font-medium">Take Photo of Hazard</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleCapture} />
                    </label>
                ) : (
                    <div className="w-full flex flex-col h-full">
                        <img src={image} className="w-full flex-1 object-cover rounded-2xl mb-4 bg-slate-800" />

                        <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                            {analyzing ? (
                                <div className="flex items-center gap-3 text-cyan-400 animate-pulse">
                                    <Sparkles className="w-5 h-5" />
                                    <span className="font-bold">AI Analyzing Hazard...</span>
                                </div>
                            ) : report ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-400 uppercase tracking-widest">Detected</span>
                                        <span className={`text-xs px-2 py-1 rounded font-bold ${report.severity === 'High' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'}`}>
                                            {report.severity} Priority
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white">{report.category}</h3>
                                    <p className="text-sm text-slate-400">{report.description}</p>

                                    <button onClick={handleSubmit} className="w-full bg-white text-black font-bold py-3 rounded-lg mt-2">
                                        Post Bounty Mission
                                    </button>
                                </div>
                            ) : (
                                <div className="text-red-400 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" /> Analysis Failed
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateFixReport;