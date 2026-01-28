import React from 'react';

export interface ProgressBarProps {
    current: number;
    max: number;
    label?: string;
    showPercentage?: boolean;
    variant?: 'default' | 'gradient' | 'success';
    className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    current,
    max,
    label,
    showPercentage = true,
    variant = 'default',
    className = ''
}) => {
    const percentage = Math.min((current / max) * 100, 100);

    const variants = {
        default: 'bg-cta',
        gradient: 'bg-gradient-to-r from-primary to-secondary',
        success: 'bg-success',
    };

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    {showPercentage && (
                        <span className="text-sm font-semibold text-gray-900">
                            {current} / {max} ({Math.round(percentage)}%)
                        </span>
                    )}
                </div>
            )}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 ${variants[variant]}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};
