import React from 'react';

export interface BadgeProps {
    variant?: 'active' | 'completed' | 'streak' | 'trustScore' | 'pending' | 'urgent';
    children: React.ReactNode;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    variant = 'active',
    children,
    className = ''
}) => {
    const baseStyles = 'px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center gap-1';

    const variants = {
        active: 'bg-success text-white',
        completed: 'bg-primary text-white',
        streak: 'bg-orange-500 text-white animate-pulse-dot',
        trustScore: 'bg-cta text-white',
        pending: 'bg-warning text-white',
        urgent: 'bg-error text-white',
    };

    return (
        <span className={`${baseStyles} ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};
