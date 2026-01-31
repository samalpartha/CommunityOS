import React from 'react';
import { Shield, CheckCircle } from 'lucide-react';

interface TrustBadgeProps {
    variant?: 'HOST' | 'VOLUNTEER' | 'ORGANIZATION';
    verified?: boolean;
    className?: string;
}

const TrustBadge: React.FC<TrustBadgeProps> = ({ variant = 'HOST', verified = true, className = '' }) => {
    if (!verified) return null;

    const styles = {
        HOST: {
            bg: 'bg-emerald-100 dark:bg-emerald-900/30',
            text: 'text-emerald-700 dark:text-emerald-300',
            icon: Shield,
            label: 'Verified Host'
        },
        VOLUNTEER: {
            bg: 'bg-indigo-100 dark:bg-indigo-900/30',
            text: 'text-indigo-700 dark:text-indigo-300',
            icon: CheckCircle,
            label: 'Vetted Volunteer'
        },
        ORGANIZATION: {
            bg: 'bg-blue-100 dark:bg-blue-900/30',
            text: 'text-blue-700 dark:text-blue-300',
            icon: Shield,
            label: 'Official Partner'
        }
    };

    const style = styles[variant];
    const Icon = style.icon;

    return (
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold border border-transparent ${style.bg} ${style.text} ${className}`}>
            <Icon className="w-3 h-3 fill-current opacity-20" />
            <Icon className="w-3 h-3 absolute" /> {/* Layered icon trick if needed, or just simple */}
            <span>{style.label}</span>
        </div>
    );
};

export default TrustBadge;
