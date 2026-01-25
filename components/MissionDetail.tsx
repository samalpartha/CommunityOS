import React, { useState, useEffect } from 'react';
import { Mission, MissionStatus, MissionType, IncidentReport, SkillLesson } from '../types';
import { Camera, CheckCircle, Shield, ArrowLeft, Send, Upload, Info } from 'lucide-react';
import { analyzeFixImage, generateConversationStarters, generateLifeSkillLesson } from '../services/geminiService';

interface MissionDetailProps {
  mission: Mission;
  onBack: () => void;
  onComplete: (missionId: string) => void;
}

const MissionDetail: React.FC<MissionDetailProps> = ({ mission, onBack, onComplete }) => {
  const [status, setStatus] = useState<MissionStatus>(mission.status);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<IncidentReport | null>(null);
  const [skillLesson, setSkillLesson] = useState<SkillLesson | null>(null);
  const [conversationStarters, setConversationStarters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize specific data based on mission type
  useEffect(() => {
    const initData = async () => {
        if (mission.type === MissionType.LIFE_SKILL && mission.skillData) {
            setIsLoading(true);
            const lesson = await generateLifeSkillLesson(mission.skillData.moduleName);
            setSkillLesson(lesson);
            setIsLoading(false);
        } else if (mission.type === MissionType.LONELY_MINUTES && mission.lonelyData) {
             const starters = await generateConversationStarters(mission.lonelyData.topic);
             setConversationStarters(starters);
        }
    };
    initData();
  }, [mission]);

  const handleAccept = () => {
    setStatus(MissionStatus.ACCEPTED);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setProofImage(base64);
      
      // Remove prefix for API
      const base64Data = base64.split(',')[1];

      // If it's a FIX mission, analyze it immediately
      if (mission.type === MissionType.FIX_BOUNTY) {
         const result = await analyzeFixImage(base64Data);
         setAnalysis(result);
      }
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleVerifyAndClose = () => {
    setStatus(MissionStatus.VERIFIED);
    setTimeout(() => {
        onComplete(mission.id);
    }, 1500);
  };

  // Render content based on status and type
  const renderContent = () => {
    if (status === MissionStatus.OPEN) {
      return (
        <div className="mt-8">
            <div className="bg-slate-100 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4"/> Mission Brief
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">{mission.description}</p>
                {mission.foodData && (
                     <div className="mt-3 text-xs bg-white p-2 rounded border border-slate-200">
                        <span className="font-bold text-slate-700">Allergens:</span> {mission.foodData.allergens.join(', ')} <br/>
                        <span className="font-bold text-slate-700">Expires:</span> {mission.foodData.expiry}
                     </div>
                )}
            </div>
            <button 
                onClick={handleAccept}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-slate-800 transition-colors"
            >
                Accept Mission
            </button>
        </div>
      );
    }

    if (status === MissionStatus.ACCEPTED || status === MissionStatus.IN_PROGRESS) {
        return (
            <div className="mt-6 space-y-6">
                
                {/* --- FIX BOUNTY FLOW --- */}
                {mission.type === MissionType.FIX_BOUNTY && (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-lg mb-2">Proof of Fix</h3>
                        <p className="text-sm text-slate-500 mb-4">Upload a photo of the completed repair.</p>
                        
                        {!proofImage ? (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Camera className="w-8 h-8 text-slate-400 mb-2" />
                                    <p className="text-sm text-slate-500">Tap to capture</p>
                                </div>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                        ) : (
                            <div className="space-y-4">
                                <img src={proofImage} alt="Proof" className="w-full h-48 object-cover rounded-lg" />
                                {isLoading ? (
                                    <div className="text-center text-sm text-slate-500 animate-pulse">AI Verifying fix...</div>
                                ) : analysis ? (
                                    <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-sm">
                                        <p className="font-bold text-green-800 flex items-center gap-2"><CheckCircle className="w-4 h-4"/> AI Verified</p>
                                        <p className="text-green-700 mt-1">Found: {analysis.category} - {analysis.severity} Severity</p>
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>
                )}

                {/* --- LONELY MINUTES FLOW --- */}
                {mission.type === MissionType.LONELY_MINUTES && (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                         <h3 className="font-bold text-lg mb-2">Conversation Guide</h3>
                         <div className="space-y-2 mb-4">
                            {conversationStarters.length > 0 ? conversationStarters.map((starter, i) => (
                                <div key={i} className="p-3 bg-blue-50 text-blue-800 rounded-lg text-sm italic">
                                    "{starter}"
                                </div>
                            )) : <p>Loading prompts...</p>}
                         </div>
                         <div className="flex gap-2">
                             <button className="flex-1 bg-green-100 text-green-800 py-3 rounded-lg font-medium text-sm">Call Connected</button>
                             <button className="flex-1 bg-red-100 text-red-800 py-3 rounded-lg font-medium text-sm">Report Issue</button>
                         </div>
                    </div>
                )}

                 {/* --- LIFE SKILL FLOW --- */}
                 {mission.type === MissionType.LIFE_SKILL && (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                         {isLoading ? (
                             <div className="p-8 text-center text-slate-500">Generating lesson...</div>
                         ) : skillLesson ? (
                             <>
                                <h3 className="font-bold text-lg mb-2">{skillLesson.title}</h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-xs font-bold uppercase text-slate-400 mb-1">Steps</h4>
                                        <ul className="list-decimal list-inside text-sm text-slate-700 space-y-1">
                                            {skillLesson.steps.map((step, i) => <li key={i}>{step}</li>)}
                                        </ul>
                                    </div>
                                    <div className="bg-emerald-50 p-3 rounded-lg">
                                        <h4 className="text-xs font-bold uppercase text-emerald-600 mb-1">Safety Check</h4>
                                        <ul className="text-sm text-emerald-800 space-y-1">
                                            {skillLesson.checklist.map((item, i) => (
                                                <li key={i} className="flex items-center gap-2">
                                                    <input type="checkbox" className="accent-emerald-600"/> {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                             </>
                         ) : null}
                    </div>
                )}
                
                {/* --- FOOD FIT FLOW --- */}
                {mission.type === MissionType.FOOD_FIT && (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                        <div className="w-32 h-32 bg-slate-900 mx-auto rounded-xl flex items-center justify-center mb-4">
                            <span className="text-white font-mono text-xs">QR CODE</span>
                        </div>
                        <p className="text-sm text-slate-600">Scan at pickup location to unlock food locker.</p>
                    </div>
                )}

                <button 
                    disabled={mission.type === MissionType.FIX_BOUNTY && !proofImage}
                    onClick={handleVerifyAndClose}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                    <Send className="w-5 h-5" /> Complete Mission
                </button>
            </div>
        );
    }

    if (status === MissionStatus.VERIFIED) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Mission Verified!</h2>
                <p className="text-slate-500 mt-2">Reward of {mission.reward} points sent to your account.</p>
                <div className="mt-8 p-4 bg-slate-50 rounded-lg text-xs text-slate-400">
                    <p>Proof stored in CommunityOS Audit Trail.</p>
                    <p className="font-mono mt-1">ID: {mission.id}-PROOF-HASH</p>
                </div>
            </div>
        );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
        <div>
            <span className="text-xs font-bold text-slate-400 uppercase">{mission.type.replace('_', ' ')}</span>
            <h1 className="text-lg font-bold text-slate-900 leading-none">{mission.title}</h1>
        </div>
      </div>

      <div className="p-4 pb-24 max-w-lg mx-auto">
        {mission.fixData?.imageUrl && (
            <img src={mission.fixData.imageUrl} alt="Mission Context" className="w-full h-48 object-cover rounded-xl mb-4 shadow-sm" />
        )}
        
        {renderContent()}

        <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 text-xs">
            <Shield className="w-3 h-3" />
            <span>Secured by CommunityOS Trust Layer</span>
        </div>
      </div>
    </div>
  );
};

export default MissionDetail;