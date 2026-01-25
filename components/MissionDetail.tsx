import React, { useState, useEffect, useRef } from 'react';
import { Mission, MissionStatus, MissionType, IncidentReport, SkillLesson } from '../types';
import { Camera, CheckCircle, Shield, ArrowLeft, Send, Upload, Info, Users, Sparkles, Smartphone, Box, Mic, MicOff, Image as ImageIcon, Volume2, BrainCircuit, Share2, CheckSquare, Square } from 'lucide-react';
import { analyzeFixImage, generateConversationStarters, generateLifeSkillLesson, generateImpactBadge, LiveSession } from '../services/geminiService';

interface MissionDetailProps {
  mission: Mission;
  onBack: () => void;
  onComplete: (mission: Mission) => void;
}

const MissionDetail: React.FC<MissionDetailProps> = ({ mission, onBack, onComplete }) => {
  const [status, setStatus] = useState<MissionStatus>(mission.status);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<IncidentReport | null>(null);
  const [skillLesson, setSkillLesson] = useState<SkillLesson | null>(null);
  const [conversationStarters, setConversationStarters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [checklistState, setChecklistState] = useState<boolean[]>([]);
  
  // Live Audio State
  const [liveStatus, setLiveStatus] = useState<string>('idle'); 
  const liveSessionRef = useRef<LiveSession | null>(null);

  // Initialize specific data based on mission type
  useEffect(() => {
    const initData = async () => {
        if (mission.type === MissionType.LIFE_SKILL && mission.skillData) {
            setIsLoading(true);
            setIsThinking(true); 
            // Use Gemini Pro to generate the lesson based on the module name/context
            const lesson = await generateLifeSkillLesson(mission.skillData.moduleName);
            setSkillLesson(lesson);
            if (lesson) setChecklistState(new Array(lesson.checklist.length).fill(false));
            setIsThinking(false);
            setIsLoading(false);
        } else if (mission.type === MissionType.LONELY_MINUTES && mission.lonelyData) {
             const starters = await generateConversationStarters(mission.lonelyData.topic);
             setConversationStarters(starters);
        }
    };
    initData();

    return () => {
        if (liveSessionRef.current) liveSessionRef.current.disconnect();
    };
  }, [mission]);

  const handleAccept = () => {
    setStatus(MissionStatus.ACCEPTED);
  };

  const handleShare = async () => {
      const shareData = {
          title: `CommunityOS Mission: ${mission.title}`,
          text: `Check out this mission: "${mission.title}". Help needed nearby!`,
          url: window.location.href 
      };
      
      try {
          if (navigator.share) {
            await navigator.share(shareData);
          } else {
            alert(`Link copied to clipboard:\n\n${shareData.text}`);
          }
      } catch (err) {
          console.error("Error sharing:", err);
      }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setProofImage(base64);
      
      const base64Data = base64.split(',')[1];

      // Smart Verification for Fix Bounties
      if (mission.type === MissionType.FIX_BOUNTY) {
         // In a real app, we would verify the "After" state. 
         // For now, we re-analyze to confirm it's a valid photo.
         const result = await analyzeFixImage(base64Data);
         setAnalysis(result);
      }
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const toggleChecklist = (index: number) => {
      const newState = [...checklistState];
      newState[index] = !newState[index];
      setChecklistState(newState);
  };

  const handleComplete = () => {
      // Construct the completed mission object with proof
      const completedMission = { ...mission, status: MissionStatus.VERIFIED };
      
      if (mission.type === MissionType.FIX_BOUNTY) {
          completedMission.proof = { imageUrl: proofImage!, verifiedAt: new Date().toISOString() };
      } else if (mission.type === MissionType.LIFE_SKILL) {
          completedMission.proof = { checklistCompleted: true, verifiedAt: new Date().toISOString() };
      }
      
      setStatus(MissionStatus.VERIFIED);
      setTimeout(() => {
          onComplete(completedMission);
      }, 1500);
  };

  const toggleLiveSession = async () => {
      if (liveStatus === 'connected') {
          liveSessionRef.current?.disconnect();
          setLiveStatus('idle');
          liveSessionRef.current = null;
      } else {
          liveSessionRef.current = new LiveSession();
          liveSessionRef.current.connect((status) => setLiveStatus(status));
      }
  };

  // Render content based on status and type
  const renderContent = () => {
    if (status === MissionStatus.OPEN) {
      return (
        <div className="mt-8">
            <div className="bg-slate-100 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                        <Info className="w-4 h-4"/> Mission Brief
                    </h4>
                    {mission.squadSize && (
                        <div className="bg-violet-100 text-violet-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                            <Users className="w-3 h-3" /> Squad Mode
                        </div>
                    )}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{mission.description}</p>
            </div>
            
            <div className="flex gap-3">
                {mission.squadSize && (
                    <button onClick={handleShare} className="flex-1 bg-violet-100 text-violet-700 py-4 rounded-xl font-bold text-lg shadow-sm hover:bg-violet-200 transition-colors flex items-center justify-center gap-2">
                        <Share2 className="w-5 h-5" /> Invite
                    </button>
                )}
                <button onClick={handleAccept} className={`flex-1 bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 ${!mission.squadSize ? 'w-full' : ''}`}>
                    {mission.squadSize ? <><Users className="w-5 h-5" /> Join Squad</> : 'Accept Mission'}
                </button>
            </div>
        </div>
      );
    }

    if (status === MissionStatus.ACCEPTED || status === MissionStatus.IN_PROGRESS) {
        return (
            <div className="mt-6 space-y-6">
                
                {/* --- FIX BOUNTY PROOF FLOW --- */}
                {mission.type === MissionType.FIX_BOUNTY && (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            Proof of Fix
                            <span className="text-[10px] bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Sparkles className="w-3 h-3"/> Smart API Active
                            </span>
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">Upload a photo of the completed repair. Vision AI will verify context.</p>
                        
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
                                    <div className="text-center text-sm text-slate-500 animate-pulse flex flex-col items-center gap-2">
                                        <Sparkles className="w-6 h-6 text-cyan-500 animate-spin" />
                                        Gemini 3 Pro is verifying closure...
                                    </div>
                                ) : analysis ? (
                                    <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-sm">
                                        <p className="font-bold text-green-800 flex items-center gap-2"><CheckCircle className="w-4 h-4"/> AI Verified</p>
                                        <p className="text-green-700 mt-1">Context match: {analysis.category}</p>
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>
                )}

                {/* --- LIFE SKILL CHECKLIST FLOW --- */}
                 {mission.type === MissionType.LIFE_SKILL && (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                         {isThinking ? (
                             <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-2">
                                 <BrainCircuit className="w-8 h-8 text-violet-500 animate-pulse" />
                                 <span>Gemini is generating your lesson...</span>
                             </div>
                         ) : skillLesson ? (
                             <>
                                <h3 className="font-bold text-lg mb-4">{skillLesson.title}</h3>
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Learning Steps</h4>
                                        <ul className="list-decimal list-inside text-sm text-slate-700 space-y-2 pl-2">
                                            {skillLesson.steps.map((step, i) => <li key={i}>{step}</li>)}
                                        </ul>
                                    </div>
                                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                        <h4 className="text-xs font-bold uppercase text-emerald-600 mb-3">Verification Checklist</h4>
                                        <div className="space-y-3">
                                            {skillLesson.checklist.map((item, i) => (
                                                <div key={i} onClick={() => toggleChecklist(i)} className="flex items-start gap-3 cursor-pointer">
                                                    {checklistState[i] ? <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0"/> : <Square className="w-5 h-5 text-emerald-400 shrink-0"/>}
                                                    <span className={`text-sm ${checklistState[i] ? 'text-emerald-900 line-through opacity-70' : 'text-emerald-800'}`}>{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                             </>
                         ) : null}
                    </div>
                )}
                
                {/* --- LONELY MINUTES FLOW (Simplified for MVP) --- */}
                {mission.type === MissionType.LONELY_MINUTES && (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                         <h3 className="font-bold text-lg mb-2">Conversation Guide</h3>
                         <div className="space-y-2 mb-4">
                            {conversationStarters.length > 0 ? conversationStarters.map((starter, i) => (
                                <div key={i} className="p-3 bg-blue-50 text-blue-800 rounded-lg text-sm italic">"{starter}"</div>
                            )) : <p>Loading prompts...</p>}
                         </div>
                    </div>
                )}

                <button 
                    disabled={
                        (mission.type === MissionType.FIX_BOUNTY && !proofImage) || 
                        (mission.type === MissionType.LIFE_SKILL && (!skillLesson || checklistState.some(c => !c)))
                    }
                    onClick={handleComplete}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                    <Send className="w-5 h-5" /> 
                    {mission.type === MissionType.LIFE_SKILL ? 'Claim Credential' : 'Complete Mission'}
                </button>
            </div>
        );
    }

    if (status === MissionStatus.VERIFIED) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Verified & Closed!</h2>
                <p className="text-slate-500 mt-2 mb-6">Reward of {mission.reward} IC sent to your wallet.</p>
                <div className="mt-4 p-4 bg-slate-50 rounded-lg text-xs text-slate-400 w-full text-left">
                    <p className="font-bold text-slate-500 mb-1">AUDIT TRAIL RECORD</p>
                    <p>ID: {mission.id}</p>
                    <p>Time: {new Date().toLocaleTimeString()}</p>
                    <p>Proof: {mission.type === MissionType.LIFE_SKILL ? 'Self-Checklist' : 'AI-Verified Image'}</p>
                </div>
            </div>
        );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 rounded-full">
                <ArrowLeft className="w-6 h-6 text-slate-700" />
            </button>
            <div>
                <span className="text-xs font-bold text-slate-400 uppercase">{mission.type.replace('_', ' ')}</span>
                <h1 className="text-lg font-bold text-slate-900 leading-none">{mission.title}</h1>
            </div>
        </div>
        <button onClick={handleShare} className="p-2 hover:bg-slate-100 rounded-full text-slate-600">
            <Share2 className="w-5 h-5" />
        </button>
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