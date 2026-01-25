import React from 'react';

interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg ${className}`} />
  );
};

export const MissionCardSkeleton: React.FC = () => {
    return (
        <div className="w-full p-4 mb-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <div className="flex gap-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="w-20 h-4 mt-2" />
                </div>
                <Skeleton className="w-12 h-6 rounded-full" />
            </div>
            <Skeleton className="w-3/4 h-6 mb-2" />
            <Skeleton className="w-full h-4 mb-1" />
            <Skeleton className="w-2/3 h-4 mb-4" />
            <div className="flex justify-between">
                <Skeleton className="w-20 h-3" />
                <Skeleton className="w-16 h-3" />
            </div>
        </div>
    );
}

export default Skeleton;