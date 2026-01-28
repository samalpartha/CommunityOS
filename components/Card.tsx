import React from 'react';

export interface CardProps {
    variant?: 'mission' | 'profile' | 'stats' | 'default';
    hoverable?: boolean;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
    variant = 'default',
    hoverable = false,
    children,
    className = '',
    onClick
}) => {
    const baseStyles = 'rounded-xl p-6 transition-all';

    const variants = {
        default: 'bg-white shadow-md',
        mission: 'bg-gradient-to-br from-white to-pink-50 shadow-md border border-pink-100',
        profile: 'bg-white shadow-lg border-l-4 border-primary',
        stats: 'bg-gradient-to-br from-blue-50 to-white shadow-md',
    };

    const hoverStyles = hoverable
        ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer'
        : '';

    return (
        <div
            className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};
