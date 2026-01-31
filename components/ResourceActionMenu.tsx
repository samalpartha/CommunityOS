import React, { useState } from 'react';
import { CommunityResource } from '../types';
import { MoreVertical, Flag, AlertCircle, Activity, X } from 'lucide-react';

interface ResourceActionMenuProps {
    resource: CommunityResource;
    onReportIssue: (resourceId: string) => void;
    onUpdateStatus: (resourceId: string, isOpen: boolean) => void;
    onUpdateVitals?: (resourceId: string) => void;
}

export const ResourceActionMenu: React.FC<ResourceActionMenuProps> = ({
    resource,
    onReportIssue,
    onUpdateStatus,
    onUpdateVitals
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleAction = (action: () => void) => {
        action();
        setIsExpanded(false);
    };

    return (
        <div className="relative">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="Resource actions"
            >
                {isExpanded ? (
                    <X className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                ) : (
                    <MoreVertical className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                )}
            </button>

            {isExpanded && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-30"
                        onClick={() => setIsExpanded(false)}
                    />

                    {/* Menu Dropdown */}
                    <div className="absolute right-0 top-10 bg-white dark:bg-slate-800 shadow-xl rounded-lg border border-slate-200 dark:border-slate-700 p-1 z-40 min-w-[220px]">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAction(() => onUpdateStatus(resource.id, !resource.isOpen));
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors"
                        >
                            <Flag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span>{resource.isOpen ? 'Mark as Closed' : 'Mark as Open'}</span>
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAction(() => onReportIssue(resource.id));
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-md transition-colors"
                        >
                            <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            <span>Report Issue</span>
                        </button>

                        {onUpdateVitals && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAction(() => onUpdateVitals(resource.id));
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-md transition-colors"
                            >
                                <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>Update Capacity/Wait</span>
                            </button>
                        )}

                        <div className="border-t border-slate-200 dark:border-slate-700 my-1" />

                        <div className="px-3 py-2 text-[10px] text-slate-400 dark:text-slate-500">
                            Hero Actions
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ResourceActionMenu;
