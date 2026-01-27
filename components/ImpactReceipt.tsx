import React from 'react';
import { DollarSign, Share2, CheckCircle, Award, MapPin, Calendar, Clock, Download } from 'lucide-react';
import { Mission } from '../types';

interface ImpactReceiptProps {
    mission: Mission;
    durationMinutes?: number; // Optional, default to 60 if not provided
    onClose: () => void;
}

const ImpactReceipt: React.FC<ImpactReceiptProps> = ({ mission, durationMinutes = 60, onClose }) => {
    // Impact Calculation Logic
    const hourlyRate = 28.50; // 2024 Independent Sector Value of Volunteer Time
    const hours = durationMinutes / 60;
    const valueGenerated = (hours * hourlyRate).toFixed(2);
    const xpEarned = Math.floor(hours * 100) + 50; // Base 50XP + 100/hr

    const handleShare = async () => {
        const shareData = {
            title: `Impact Report: ${mission.title}`,
            text: `I just generated $${valueGenerated} of community value by completing "${mission.title}" on CommunityOS!`,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error("Share failed", err);
            }
        } else {
            // Fallback
            navigator.clipboard.writeText(shareData.text);
            alert('Impact summary copied to clipboard!');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 w-full animate-in fade-in zoom-in duration-300">

            {/* Receipt Container */}
            <div className="bg-white dark:bg-slate-200 text-slate-900 w-full max-w-sm shadow-2xl rounded-sm overflow-hidden relative">

                {/* Jagged Top Edge (CSS Trick or SVG) */}
                <div className="absolute top-0 left-0 w-full h-2 bg-slate-900 dark:bg-indigo-600 opacity-10"></div>

                {/* Header */}
                <div className="p-6 text-center border-b-2 border-dashed border-slate-300">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-widest text-slate-900">Impact Receipt</h2>
                    <p className="text-xs text-slate-500 font-mono mt-1">{new Date().toLocaleDateString().toUpperCase()} • {new Date().toLocaleTimeString()}</p>
                </div>

                {/* Line Items */}
                <div className="p-6 space-y-4 font-mono text-sm">
                    <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-600">MISSION</span>
                        <span className="text-right max-w-[150px] font-bold">{mission.title}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">LOCATION</span>
                        <span className="text-right flex items-center gap-1 justify-end">
                            <MapPin className="w-3 h-3" /> {mission.location.name ?? 'Unknown'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">DURATION</span>
                        <span className="text-right">{hours < 1 ? `${durationMinutes} mins` : `${hours.toFixed(1)} hrs`}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">RATE (Est.)</span>
                        <span className="text-right">${hourlyRate.toFixed(2)}/hr</span>
                    </div>

                    <div className="border-t-2 border-dashed border-slate-300 my-4"></div>

                    {/* Totals */}
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>COMMUNITY VALUE</span>
                        <span className="text-emerald-700">${valueGenerated}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 text-xs mt-1">
                        <span>XP EARNED</span>
                        <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {xpEarned} XP</span>
                    </div>
                </div>

                {/* Footer / Barcode */}
                <div className="bg-slate-100 p-4 text-center border-t border-slate-200">
                    <div className="h-12 w-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Barcode_UPC-A.svg/1200px-Barcode_UPC-A.svg.png')] bg-cover opacity-60 mix-blend-multiply mb-2"></div>
                    <p className="text-[10px] text-slate-400 font-mono uppercase">VERIFIED BY COMMUNITY HERO TRUST LAYER</p>
                    <p className="text-[10px] text-slate-400 font-mono">{mission.id.substring(0, 16)}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 w-full max-w-sm mt-6">
                <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                    Close
                </button>
                <button
                    onClick={handleShare}
                    className="flex-1 py-3 rounded-xl font-bold bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                    <Share2 className="w-4 h-4" /> Share Impact
                </button>
            </div>
        </div>
    );
};

export default ImpactReceipt;
