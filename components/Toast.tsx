import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  title: string;
  message: string;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
        onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div className={`
        flex items-start gap-3 p-4 rounded-xl shadow-xl border w-full max-w-sm transition-all animate-in slide-in-from-top-2
        ${toast.type === 'success' ? 'bg-white border-green-100' : 'bg-white border-red-100'}
    `}>
        <div className={`p-2 rounded-full shrink-0 ${toast.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
        </div>
        <div className="flex-1">
            <h4 className={`font-bold text-sm ${toast.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{toast.title}</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{toast.message}</p>
        </div>
        <button onClick={() => onDismiss(toast.id)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4"/>
        </button>
    </div>
  );
};

export default Toast;