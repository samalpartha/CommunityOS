import React, { useState } from 'react';
import StepRoleSelection from './StepRoleSelection';
import StepLocation from './StepLocation';

interface OnboardingFlowProps {
    onComplete: (data: { role: 'VOLUNTEER' | 'BENEFICIARY'; location: GeolocationPosition }) => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
    const [step, setStep] = useState<number>(0);
    const [role, setRole] = useState<'VOLUNTEER' | 'BENEFICIARY' | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    const handleRoleSelect = (selectedRole: 'VOLUNTEER' | 'BENEFICIARY') => {
        setRole(selectedRole);
        setStep(1); // Move to Location Step
    };

    const handleGrantLocation = async () => {
        setIsLocating(true);

        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            setIsLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setIsLocating(false);
                if (role) {
                    onComplete({ role, location: position });
                }
            },
            (error) => {
                setIsLocating(false);
                console.error("Location error:", error);
                alert('Unable to retrieve your location. Please check your settings.');
            }
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-rose-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2 animate-blob"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/2 translate-y-1/2 animate-blob animation-delay-2000"></div>

            <div className="relative z-10 flex-1">
                {step === 0 && <StepRoleSelection onSelectRole={handleRoleSelect} />}
                {step === 1 && <StepLocation onGrantLocation={handleGrantLocation} isLocating={isLocating} />}
            </div>

            {/* Pagination/Progress (Subtle) */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-20">
                <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 0 ? 'w-8 bg-rose-600' : 'w-2 bg-slate-300'}`} />
                <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-rose-600' : 'w-2 bg-slate-300'}`} />
            </div>
        </div>
    );
};

export default OnboardingFlow;
