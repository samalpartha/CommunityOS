import React, { useState } from 'react';
import { ArrowRight, Mail, Lock, User, PlayCircle, ShieldCheck } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (provider?: string) => void;
  onDemoTour: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onDemoTour }) => {
  const [isSignUp, setIsSignUp] = useState(false);

  // Social Icons (Inline SVGs for brand accuracy)
  const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );

  const AppleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="black">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74s2.57-.99 3.87-.75c.68.03 2.19.47 3.07 1.74-2.67 1.6-2.21 5.3.35 6.43-.6 1.76-1.42 3.38-2.37 4.81zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );

  const FacebookIcon = () => (
    <svg className="w-5 h-5 fill-[#1877F2]" viewBox="0 0 24 24">
       <path d="M9.945 22v-8.834H7V9.485h2.945V6.54c0-3.043 1.926-4.54 4.64-4.54 1.3 0 2.46.097 2.46.097v2.456h-1.386c-1.554 0-2.04.965-2.04 1.845v2.088h2.86l-.456 3.68h-2.404V22h-3.62z"/>
    </svg>
  );

  const InstagramIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
        <defs>
            <linearGradient id="instaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#f09433'}} />
                <stop offset="25%" style={{stopColor: '#e6683c'}} />
                <stop offset="50%" style={{stopColor: '#dc2743'}} />
                <stop offset="75%" style={{stopColor: '#cc2366'}} />
                <stop offset="100%" style={{stopColor: '#bc1888'}} />
            </linearGradient>
        </defs>
      <path fill="url(#instaGrad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.225-.149-4.771-1.664-4.919-4.919-.058-1.265-.069-1.644-.069-4.849 0-3.204.012-3.584.069-4.849.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.668-.072-4.948-.2-4.354-2.618-6.782-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>

        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex overflow-hidden min-h-[600px] z-10">
            
            {/* Left: Branding & Info */}
            <div className="hidden md:flex flex-col justify-between w-1/2 bg-slate-50 p-12 border-r border-slate-100">
                <div>
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-xl text-slate-800 tracking-tight">Community Hero</span>
                    </div>
                    
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
                        Turn real-world needs into <span className="text-indigo-600">verified action.</span>
                    </h1>
                    <p className="text-slate-500 text-lg leading-relaxed mb-8">
                        Join the neighborhood network that rewards you for fixing hazards, sharing food, and connecting with seniors.
                    </p>
                    
                    <div className="flex gap-2">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex-1">
                            <span className="block text-2xl font-bold text-slate-900 mb-1">4.2k</span>
                            <span className="text-xs text-slate-500 font-bold uppercase">Missions Done</span>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex-1">
                            <span className="block text-2xl font-bold text-slate-900 mb-1">$120k</span>
                            <span className="text-xs text-slate-500 font-bold uppercase">Value Created</span>
                        </div>
                    </div>
                </div>

                <div className="text-sm text-slate-400">
                    &copy; 2025 Community Hero. Verified by City Grid.
                </div>
            </div>

            {/* Right: Login Form */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">{isSignUp ? 'Create an Account' : 'Welcome Back'}</h2>
                    <p className="text-slate-500 text-sm mt-2">
                        {isSignUp ? 'Join your local community today.' : 'Enter your details to access your missions.'}
                    </p>
                </div>

                <div className="space-y-4 mb-6">
                    {isSignUp && (
                         <div className="relative">
                            <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                            <input type="text" placeholder="Full Name" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                        </div>
                    )}
                    <div className="relative">
                        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                        <input type="email" placeholder="Email Address" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                        <input type="password" placeholder="Password" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                    </div>
                </div>

                <button onClick={() => onLogin('Email')} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 mb-6">
                    {isSignUp ? 'Sign Up' : 'Sign In'} <ArrowRight className="w-4 h-4" />
                </button>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-slate-500">Or continue with</span>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-8">
                    <button onClick={() => onLogin('Google')} className="flex items-center justify-center p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors transform active:scale-95">
                        <GoogleIcon />
                    </button>
                    <button onClick={() => onLogin('Apple')} className="flex items-center justify-center p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors transform active:scale-95">
                        <AppleIcon />
                    </button>
                    <button onClick={() => onLogin('Facebook')} className="flex items-center justify-center p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors transform active:scale-95">
                        <FacebookIcon />
                    </button>
                    <button onClick={() => onLogin('Instagram')} className="flex items-center justify-center p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors transform active:scale-95">
                        <InstagramIcon />
                    </button>
                </div>

                <div className="space-y-4">
                    <button 
                        onClick={onDemoTour}
                        className="w-full group bg-indigo-50 text-indigo-700 font-bold py-3 rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                        Take a Demo Tour
                    </button>

                    <p className="text-center text-sm text-slate-500">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"} 
                        <button onClick={() => setIsSignUp(!isSignUp)} className="font-bold text-indigo-600 ml-1 hover:underline">
                            {isSignUp ? 'Sign In' : 'Create User'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default LoginScreen;