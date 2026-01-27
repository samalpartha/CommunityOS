import React from 'react';
import { User } from '../types';
import { GraduationCap, Award, Download } from 'lucide-react';

interface HourTrackerProps {
    user: User;
    onExportCertificate?: () => void;
}

const HourTracker: React.FC<HourTrackerProps> = ({ user, onExportCertificate }) => {
    if (!user.studentData) return null;

    const { verifiedHours, pendingHours, certificates } = user.studentData;
    const totalHours = verifiedHours + pendingHours;

    // Determine tier
    const getTier = (hours: number) => {
        if (hours >= 100) return { name: 'GOLD', color: 'bg-yellow-500', emoji: '🏆' };
        if (hours >= 50) return { name: 'SILVER', color: 'bg-slate-400', emoji: '🥈' };
        if (hours >= 10) return { name: 'BRONZE', color: 'bg-amber-600', emoji: '🥉' };
        return { name: 'STARTING', color: 'bg-slate-300', emoji: '🌱' };
    };

    const currentTier = getTier(verifiedHours);
    const nextMilestone = verifiedHours < 10 ? 10 : verifiedHours < 50 ? 50 : 100;
    const progress = Math.min((verifiedHours / nextMilestone) * 100, 100);

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-4 space-y-4">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                        <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Volunteer Hours</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user.studentData.schoolName}</p>
                    </div>
                </div>
                <span className="text-2xl">{currentTier.emoji}</span>
            </div>

            {/* Hour Stats */}
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{verifiedHours}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verified</div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingHours}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pending</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                    <span>{currentTier.name} Tier</span>
                    <span>{verifiedHours}/{nextMilestone} hrs</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${currentTier.color} transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
                {verifiedHours < 100 && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        {nextMilestone - verifiedHours} hrs to next tier
                    </p>
                )}
            </div>

            {/* Certificates */}
            {certificates.length > 0 && (
                <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                            <Award className="w-3 h-3" /> Certificates
                        </div>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{certificates.length}</span>
                    </div>
                    <button
                        onClick={onExportCertificate}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors"
                    >
                        <Download className="w-3 h-3" /> Export Certificate
                    </button>
                </div>
            )}
        </div>
    );
};

export default HourTracker;
