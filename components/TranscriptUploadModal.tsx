import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, CheckCircle, Loader2, School, Award, ArrowRight } from 'lucide-react';
import { Badge } from './index';

interface TranscriptUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSyncComplete: (creditsEarned: number) => void;
}

const TranscriptUploadModal: React.FC<TranscriptUploadModalProps> = ({ isOpen, onClose, onSyncComplete }) => {
    const [step, setStep] = useState<'UPLOAD' | 'ANALYZING' | 'REVIEW' | 'SUCCESS'>('UPLOAD');
    const [uploadProgress, setUploadProgress] = useState(0);

    // Mock Data for "Parsed" Grades
    const parsedGrades = [
        { subject: 'AP Civics', grade: 'A', credits: 50, reason: 'Civic Engagement' },
        { subject: 'Environmental Science', grade: 'B+', credits: 30, reason: 'Sustainability Knowledge' },
        { subject: 'Debate Club', grade: 'Participation', credits: 20, reason: 'Community Leadership' },
    ];

    const totalCredits = parsedGrades.reduce((sum, item) => sum + item.credits, 0);

    const handleUpload = () => {
        setStep('ANALYZING');
        // Simulate upload and analysis via service
        // In real app: await educationService.uploadTranscript(file);

        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                // Mock result from service
                setTimeout(() => setStep('REVIEW'), 500);
            }
        }, 300);
    };

    const handleConfirm = () => {
        setStep('SUCCESS');
        setTimeout(() => {
            onSyncComplete(totalCredits);
            onClose();
            setStep('UPLOAD'); // Reset for next time
            setUploadProgress(0);
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                    <div>
                        <h2 className="text-xl font-heading text-slate-900 dark:text-white flex items-center gap-2">
                            <School className="w-6 h-6 text-indigo-500" />
                            Academic Sync
                        </h2>
                        <p className="text-sm text-slate-500">Turn your grades into Impact Credits</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content Body */}
                <div className="p-8">
                    {step === 'UPLOAD' && (
                        <div className="text-center space-y-6">
                            <div className="border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-10 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all cursor-pointer group" onClick={handleUpload}>
                                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <Upload className="w-8 h-8" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Upload Transcript</h3>
                                <p className="text-sm text-slate-500">PDF, JPG, or PNG supported</p>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-slate-400 font-bold justify-center uppercase tracking-widest">
                                <span className="h-px bg-slate-200 w-12"></span>
                                OR
                                <span className="h-px bg-slate-200 w-12"></span>
                            </div>

                            <button onClick={handleUpload} className="w-full py-4 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <School className="w-5 h-5" /> Connect Canvas / Blackboard
                            </button>
                        </div>
                    )}

                    {step === 'ANALYZING' && (
                        <div className="text-center py-10 space-y-6">
                            <div className="relative w-24 h-24 mx-auto">
                                <Loader2 className="w-full h-full text-indigo-500 animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center font-bold text-xs">{uploadProgress}%</div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white animate-pulse">Analyzing Academic Record...</h3>
                                <p className="text-sm text-slate-500 mt-2">Identifying Civic & Social subjects</p>
                            </div>
                        </div>
                    )}

                    {step === 'REVIEW' && (
                        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800 flex items-center gap-3">
                                <Award className="w-8 h-8 text-emerald-600" />
                                <div>
                                    <h4 className="font-bold text-emerald-700 dark:text-emerald-400">Analysis Complete</h4>
                                    <p className="text-xs text-emerald-600/80">We found 3 eligible subjects!</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {parsedGrades.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{item.subject}</p>
                                            <p className="text-xs text-slate-500">Grade: {item.grade} • {item.reason}</p>
                                        </div>
                                        <Badge variant="active" className="bg-indigo-100 text-indigo-700">+{item.credits} Credits</Badge>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                                <span className="text-sm font-bold text-slate-500">Total Calculation</span>
                                <span className="text-2xl font-black text-indigo-600">+{totalCredits} Credits</span>
                            </div>

                            <button
                                onClick={handleConfirm}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/30"
                            >
                                Confirm & Redeem Credits <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {step === 'SUCCESS' && (
                        <div className="text-center py-10 space-y-4 animate-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Credits Added!</h3>
                            <p className="text-slate-500">Your academic efforts have been recognized.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TranscriptUploadModal;
