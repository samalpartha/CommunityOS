import React from 'react';
import { X, MessageCircle, FileText, Phone, ExternalLink } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-slate-900 p-4 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">Help & Support</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Common Questions</h3>
            <details className="group">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-sm text-slate-700">
                <span>How do verified missions work?</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                Missions are verified using AI image analysis or community consensus. Once verified, points are released to your wallet.
              </p>
            </details>
            
            <details className="group">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-sm text-slate-700">
                <span>Is my location data safe?</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                Yes. We only share approximate location until you accept a mission. Your home address is never public.
              </p>
            </details>
            
            <details className="group">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-sm text-slate-700">
                <span>How do I cash out Impact Credits?</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                Credits can be redeemed for local business vouchers or donated to charity via the Wallet tab.
              </p>
            </details>
          </div>

          <div className="space-y-3">
             <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Contact Us</h3>
             <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-left transition-colors">
                <div className="bg-indigo-100 text-indigo-600 p-2 rounded-full">
                    <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-900">Chat with Support</p>
                    <p className="text-xs text-slate-500">Typical reply time: 5 mins</p>
                </div>
             </button>
             <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-left transition-colors">
                <div className="bg-emerald-100 text-emerald-600 p-2 rounded-full">
                    <Phone className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-900">Emergency Safety Line</p>
                    <p className="text-xs text-slate-500">For urgent safety issues only</p>
                </div>
             </button>
          </div>
        </div>
        
        <div className="bg-slate-50 p-4 text-center text-xs text-slate-400 border-t border-slate-100">
            Community Hero v1.0.2 • Build 2025.04
        </div>
      </div>
    </div>
  );
};

export default HelpModal;