import React, { useState } from 'react';
import { Camera, MapPin, X, AlertTriangle, CheckCircle, Mic } from 'lucide-react';
import { IncidentReportType } from '../types';

interface ReportIncidentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (report: any) => void;
}

const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [step, setStep] = useState(1);
    const [type, setType] = useState<IncidentReportType | null>(null);
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    if (!isOpen) return null;

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                setImage(base64);

                // Optional: Auto-detect type
                setIsAnalyzing(true);
                try {
                    // Mock analysis or reuse existing
                    setTimeout(() => setIsAnalyzing(false), 1500);
                } catch {
                    setIsAnalyzing(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        onSubmit({
            id: Date.now().toString(),
            type,
            description,
            location: 'Current Location (Simulated)',
            timestamp: new Date().toISOString(),
            image
        });
        onClose();
        setStep(1);
        setType(null);
        setDescription('');
        setImage(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={onClose} />

            <div className="bg-white dark:bg-slate-900 w-full md:w-[500px] md:rounded-2xl rounded-t-2xl p-6 pointer-events-auto relative shadow-2xl animate-slideUp">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                    <X className="w-6 h-6 text-slate-500" />
                </button>

                <h2 className="text-2xl font-black mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                    Report Incident
                </h2>

                {step === 1 && (
                    <div className="space-y-4">
                        <p className="text-slate-500 font-medium">What is happening?</p>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.values(IncidentReportType).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => { setType(t); setStep(2); }}
                                    className="p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-red-500 rounded-xl font-bold text-left text-sm transition-colors uppercase tracking-tight"
                                >
                                    {t.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300 font-bold text-sm mb-4">
                            <AlertTriangle className="w-4 h-4" /> Reporting: {type}
                        </div>

                        <label className="block w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            {image ? (
                                <img src={image} alt="Evidence" className="h-full w-full object-cover rounded-xl" />
                            ) : (
                                <>
                                    <Camera className="w-8 h-8 text-slate-400 mb-2" />
                                    <span className="text-sm text-slate-500 font-bold">Add Photo/Video</span>
                                </>
                            )}
                            <input type="file" accept="image/*,video/*" className="hidden" onChange={handleImageUpload} />
                        </label>

                        {isAnalyzing && <p className="text-xs text-center text-slate-400 animate-pulse">Analyzing evidence...</p>}

                        <div className="relative">
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe details (optional)..."
                                className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-xl resize-none h-24 focus:ring-2 focus:ring-red-500 outline-none"
                            />
                            <button className="absolute bottom-3 right-3 p-2 bg-white dark:bg-slate-700 rounded-full shadow-sm">
                                <Mic className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                            <MapPin className="w-3 h-3" />
                            <span>Location auto-tagged</span>
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all"
                        >
                            Submit Report
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportIncidentModal;
