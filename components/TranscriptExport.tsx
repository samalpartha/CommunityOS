import React, { useState } from 'react';
import { User } from '../types';
import { Download, FileText, CheckCircle, Loader2 } from 'lucide-react';

interface TranscriptExportProps {
    user: User;
    className?: string;
}

const TranscriptExport: React.FC<TranscriptExportProps> = ({ user, className = '' }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsGenerating(true);
        // Simulate PDF generation
        await new Promise(resolve => setTimeout(resolve, 1500));
        setDownloadUrl('#'); // Mock download available
        setIsGenerating(false);
    };

    if (!user.studentData) return null;

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 ${className}`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-full text-indigo-600 dark:text-indigo-400">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg dark:text-white">Official Service Transcript</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-tight mt-1">
                            Verified record of hours for college applications & scholarships.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mb-4 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Verified Hours</span>
                    <span className="text-xl font-black text-slate-800 dark:text-white">{user.studentData.verifiedHours} hrs</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Values estimated @ $25/hr</span>
                    <span className="text-green-600 font-bold">${(user.studentData.verifiedHours * 25).toLocaleString()} Impact</span>
                </div>
            </div>

            <div className="flex gap-2">
                {!downloadUrl ? (
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Loader2 className="w-4 h-4 opacity-0" />} {/* Hack to keep height stable */}
                        {isGenerating ? 'Generating PDF...' : 'Generate Transcript'}
                    </button>
                ) : (
                    <button
                        className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 animate-in fade-in zoom-in"
                        onClick={() => {
                            // In real app, this triggers the download
                            const link = document.createElement('a');
                            link.href = downloadUrl;
                            link.download = `Transcript_${user.name.replace(' ', '_')}.pdf`;
                            // link.click(); // Mocked
                            alert("Transcript PDF Downloaded!");
                            setDownloadUrl(null); // Reset
                        }}
                    >
                        <Download className="w-4 h-4" /> Download PDF
                    </button>
                )}
            </div>
        </div>
    );
};

export default TranscriptExport;
