import React from 'react';
import { X } from 'lucide-react';
import Leaderboard from './Leaderboard';

interface LeaderboardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg max-h-[85vh] shadow-2xl relative flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                    <X className="w-5 h-5 text-slate-500" />
                </button>

                <div className="flex-1 overflow-hidden">
                    <Leaderboard />
                </div>
            </div>
        </div>
    );
};

export default LeaderboardModal;
