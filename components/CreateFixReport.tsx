import React, { useState } from 'react';
import { Camera, X, Sparkles, AlertTriangle } from 'lucide-react';
import { analyzeFixImage } from '../services/geminiService';
import { IncidentReport, MissionType } from '../types';

interface CreateFixReportProps {
  onClose: () => void;
  onSubmit: (report: any) => void;
}

const CreateFixReport: React.FC<CreateFixReportProps> = ({ onClose, onSubmit }) => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<IncidentReport | null>(null);

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
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      <div className="p-4 flex justify-between items-center text-white">
        <h2 className="font-bold text-lg">One Tap Fix</h2>
        <button onClick={onClose}><X className="w-6 h-6" /></button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {!image ? (
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
                            <AlertTriangle className="w-5 h-5"/> Analysis Failed
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