import React, { useState, useEffect, useRef } from 'react';
import { Mission, MissionStatus, MissionType, IncidentReport, SkillLesson } from '../types';
import { Camera, CheckCircle, Shield, ArrowLeft, Send, Upload, Info, Users, Sparkles, Smartphone, Box, Mic, MicOff, Image as ImageIcon, Volume2, BrainCircuit, Share2, CheckSquare, Square, Activity, Truck, AlertTriangle, Leaf, Zap } from 'lucide-react';
import TrustBadge from './TrustBadge';
import { analyzeFixImage, generateConversationStarters, generateLifeSkillLesson, voiceManager, verifyFixCompletion, FixAnalysis } from '../services/geminiService';
import GuardianTimer from './GuardianTimer';
import RatingModal from './RatingModal';
import ImpactReceipt from './ImpactReceipt';
import SignaturePad from './SignaturePad';

interface MissionDetailProps {
    mission: Mission;
    onBack: () => void;
    onComplete: (mission: Mission) => void;
    addToast: (type: 'success' | 'error', title: string, message: string) => void;
    bigButtonMode?: boolean;
}

const MissionDetail: React.FC<MissionDetailProps> = ({ mission, onBack, onComplete, addToast, bigButtonMode }) => {
    const [status, setStatus] = useState<MissionStatus>(mission.status);
    const [proofImage, setProofImage] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<FixAnalysis | null>(null);
    const [skillLesson, setSkillLesson] = useState<SkillLesson | null>(null);
    const [conversationStarters, setConversationStarters] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [checklistState, setChecklistState] = useState<boolean[]>([]);
    const [verificationResult, setVerificationResult] = useState<{ isMatch: boolean, reason: string } | null>(null);

    // Phase 7: Trust & Safety + Accessibility
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [pendingCompletion, setPendingCompletion] = useState<Mission | null>(null);
    const [isProofMode, setIsProofMode] = useState(false); // For Big Button Mode toggle
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    const [supervisorSignature, setSupervisorSignature] = useState<string | null>(null);

    // Live Audio State (Real-Time Teacher)
    const [liveStatus, setLiveStatus] = useState<string>(() => voiceManager.getStatus());

    // Initialize specific data based on mission type
    useEffect(() => {
        const initData = async () => {
            if (mission.type === MissionType.LIFE_SKILL && mission.skillData) {
                setIsLoading(true);
                setIsThinking(true);
                // Use Gemini Pro to generate the lesson based on the module name/context
                const lesson = await generateLifeSkillLesson(mission.skillData.moduleName);
                setSkillLesson(lesson);
                if (lesson?.checklist?.length) setChecklistState(new Array(lesson.checklist.length).fill(false));
                setIsThinking(false);
                setIsLoading(false);
            } else if (mission.type === MissionType.LONELY_MINUTES && mission.lonelyData) {
                const starters = await generateConversationStarters(mission.lonelyData.topic);
                setConversationStarters(starters);
            }
        };
        initData();

        return () => {
            // No longer disconnect on unmount so voice can persist across tabs if desired
            // Just cleanup the listener
        };
    }, [mission]);

    useEffect(() => {
        const unsubscribe = voiceManager.onStatusChange((status) => setLiveStatus(status));
        return () => unsubscribe();
    }, []);

    const handleAccept = () => {
        setStatus(MissionStatus.ACCEPTED);
        addToast('success', 'Mission Accepted', 'You are now on this mission. Good luck!');
    };

    const handleShare = async () => {
        const shareData = {
            title: `Community Hero Mission: ${mission.title}`,
            text: `Check out this mission: "${mission.title}". Help needed nearby!`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                navigator.clipboard.writeText(shareData.url);
                addToast('success', 'Link Copied', 'Mission link copied to clipboard.');
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
                // Perform Before/After comparison if initial image exists
                if (mission.fixData?.imageUrl && mission.fixData.imageUrl.startsWith('data:')) {
                    const beforeData = mission.fixData.imageUrl.split(',')[1];
                    const result = await verifyFixCompletion(beforeData, base64Data);
                    setVerificationResult(result);
                    if (result.isMatch) {
                        addToast('success', 'Verification Passed', 'The fix matches the original report context.');
                    } else {
                        addToast('error', 'Verification Failed', result.reason);
                    }
                } else {
                    // Fallback to simple analysis if no "before" data-uri available (e.g. mock urls)
                    const result = await analyzeFixImage(base64Data);
                    setAnalysis(result);
                    addToast('success', 'Photo Analyzed', 'Image successfully processed.');
                }
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

        // Add signature if present
        if (supervisorSignature) {
            completedMission.proof = {
                ...completedMission.proof,
                aiVerificationNote: 'Verified by Supervisor Signature' // Re-using field for now
            };
        }

        // Phase 7: Trigger Rating Modal before closing
        setPendingCompletion(completedMission);
        setShowRatingModal(true);
    };

    const handleRatingSubmit = (score: number, tags: string[], comments: string) => {
        if (!pendingCompletion) return;

        const finalMission = {
            ...pendingCompletion,
            rating: {
                score,
                tags,
                comments,
                ratedBy: 'current-user-id', // In real app, get from auth context
                ratedAt: new Date().toISOString()
            }
        };

        // Update pending completion with the rated mission so Impact Receipt has correct data
        setPendingCompletion(finalMission);
        setStatus(MissionStatus.VERIFIED);
        // We do NOT auto-close here anymore. We wait for Impact Receipt "Close" or "Share" action.
    };

    const toggleLiveTutor = async () => {
        if (liveStatus === 'connected') {
            voiceManager.disconnect();
        } else {
            await voiceManager.connect('TEACHER');
        }
    };

    // Render content based on status and type
    const renderContent = () => {
        if (status === MissionStatus.OPEN) {
            return (
                <div className="mt-8">
                    {/* Impact Preview Banner */}
                    <div className="bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl p-6 text-white text-center shadow-lg transform hover:scale-[1.02] transition-transform mb-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-20 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-yellow-400 opacity-20 rounded-full blur-2xl"></div>

                        <div className="relative z-10 flex flex-col items-center gap-2">
                            <div className="bg-white/20 p-2 rounded-full mb-1">
                                <Zap className="w-6 h-6 text-white fill-current animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-black font-heading uppercase tracking-wide">
                                Impact Reward
                            </h3>
                            <p className="text-white/90 font-medium text-lg">
                                Complete this to earn <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded">{mission.reward} Credits</span> and help your neighbors!
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 mb-6 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                <Info className="w-4 h-4" /> Mission Brief
                            </h4>
                            <div className="flex gap-2">
                                {(mission.isOfficial || mission.verifiedSource) && (
                                    <TrustBadge variant={mission.isOfficial ? 'ORGANIZATION' : 'HOST'} />
                                )}
                                {mission.squadSize && (
                                    <div className="bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-200 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                        <Users className="w-3 h-3" /> Squad Mode
                                    </div>
                                )}
                            </div>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{mission.description}</p>

                        {/* Concept 2: Medimate Data */}
                        {mission.type === MissionType.MEDICAL_NEED && mission.medicalData && (
                            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-3 rounded-lg">
                                <h5 className="text-xs font-bold text-red-800 dark:text-red-300 uppercase mb-2 flex items-center gap-2">
                                    <Activity className="w-3 h-3" /> Medimate Request
                                </h5>
                                <div className="grid grid-cols-2 gap-2 text-sm text-red-700 dark:text-red-200">
                                    {mission.medicalData.bloodType && (
                                        <div><span className="font-bold">Blood:</span> {mission.medicalData.bloodType}</div>
                                    )}
                                    {mission.medicalData.medication && (
                                        <div><span className="font-bold">Meds:</span> {mission.medicalData.medication}</div>
                                    )}
                                    {mission.medicalData.isUrgentTransport && (
                                        <div className="col-span-2 flex items-center gap-1 font-bold">
                                            <Truck className="w-3 h-3" /> Transport Required
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Environmental Data */}
                        {mission.type === MissionType.ENVIRONMENTAL && mission.ecoData && (
                            <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 p-3 rounded-lg">
                                <h5 className="text-xs font-bold text-green-800 dark:text-green-300 uppercase mb-2 flex items-center gap-2">
                                    <Leaf className="w-3 h-3" /> Impact Goal
                                </h5>
                                <div className="text-sm text-green-700 dark:text-green-200">
                                    <span className="font-bold">{mission.ecoData.activityType}:</span> Target {mission.ecoData.targetMetric}
                                </div>
                            </div>
                        )}

                        {/* Safety Patrol Data */}
                        {mission.type === MissionType.SAFETY_PATROL && mission.safetyData && (
                            <div className="mt-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-3 rounded-lg">
                                <h5 className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase mb-2 flex items-center gap-2">
                                    <Shield className="w-3 h-3" /> Patrol Details
                                </h5>
                                <div className="text-sm text-indigo-700 dark:text-indigo-200">
                                    <span className="font-bold">Route:</span> {mission.safetyData.patrolRoute}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        {mission.squadSize && (
                            <button onClick={handleShare} className="flex-1 bg-violet-100 text-violet-700 py-4 rounded-xl font-bold text-lg shadow-sm hover:bg-violet-200 transition-colors flex items-center justify-center gap-2">
                                <Share2 className="w-5 h-5" /> Invite
                            </button>
                        )}
                        <button onClick={handleAccept} className={`flex-1 bg-slate-900 dark:bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 ${!mission.squadSize ? 'w-full' : ''}`}>
                            {mission.squadSize ? <><Users className="w-5 h-5" /> Join Squad</> : 'Accept Mission'}
                        </button>
                    </div>
                </div>
            );
        }

        if (status === MissionStatus.ACCEPTED || status === MissionStatus.IN_PROGRESS) {
            // Accessibility: Big Button Mode (Default for IN_PROGRESS or when enabled in settings)
            if (!isProofMode && (status === MissionStatus.IN_PROGRESS || bigButtonMode)) {
                return (
                    <div className="flex flex-col gap-4 mt-8 min-h-[50vh] justify-center">
                        <div className="text-center mb-6">
                            <div className="inline-flex p-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-4 animate-pulse">
                                <Activity className="w-12 h-12" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Mission Active</h2>
                            <p className="text-slate-500 dark:text-slate-400">Focus Mode Enabled</p>
                        </div>

                        <button
                            onClick={() => setIsProofMode(true)}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white p-8 rounded-3xl shadow-xl transition-all flex flex-col items-center gap-2 group"
                        >
                            <CheckCircle className="w-16 h-16 group-hover:scale-110 transition-transform" />
                            <span className="text-2xl font-black uppercase tracking-wider">Complete</span>
                        </button>

                        {/* Phase 2: Safety Check-in */}
                        <button
                            onClick={() => addToast('success', 'Checked In', 'Your location has been logged. Guardian notified.')}
                            className="w-full bg-blue-500 hover:bg-blue-600 active:scale-95 text-white p-6 rounded-3xl shadow-lg transition-all flex flex-col items-center gap-2"
                        >
                            <Shield className="w-8 h-8" />
                            <span className="font-bold uppercase tracking-wider">I'm Safe Check-in</span>
                        </button>

                        <button
                            onClick={() => addToast('error', 'EMERGENCY ALERT', 'Notifying Emergency Contacts & 911...')}
                            className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 active:scale-95 p-6 rounded-3xl border-2 border-transparent hover:border-red-500 transition-all flex flex-col items-center gap-2"
                        >
                            <AlertTriangle className="w-8 h-8" />
                            <span className="font-bold uppercase tracking-wider">Emergency Help</span>
                        </button>

                        {/* Phase 2: Squad Chat */}
                        {mission.squadSize && (
                            <button
                                onClick={() => addToast('success', 'Squad Chat', 'Connecting to secure squad channel...')}
                                className="w-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 hover:bg-violet-200 active:scale-95 p-6 rounded-3xl transition-all flex flex-col items-center gap-2"
                            >
                                <Users className="w-8 h-8" />
                                <span className="font-bold uppercase tracking-wider">Squad Chat</span>
                            </button>
                        )}

                        {!bigButtonMode && (
                            <button
                                onClick={() => setIsProofMode(true)}
                                className="mt-4 text-slate-400 underline text-sm"
                            >
                                View Mission Details
                            </button>
                        )}
                    </div>
                );
            }

            return (
                <div className="mt-6 space-y-6">

                    {/* --- FIX BOUNTY PROOF FLOW --- */}
                    {mission.type === MissionType.FIX_BOUNTY && (
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                            <h3 className="font-bold text-lg mb-2 flex items-center gap-2 dark:text-white">
                                Proof of Fix
                                <span className="text-[10px] bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> Smart API Active
                                </span>
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Upload a photo of the completed repair. Vision AI will verify context.</p>

                            {!proofImage ? (
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Camera className="w-8 h-8 text-slate-400 mb-2" />
                                        <p className="text-sm text-slate-500">Tap to capture 'After' photo</p>
                                    </div>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                </label>
                            ) : (
                                <div className="space-y-4">
                                    {/* Phase 2: Before & After Comparison */}
                                    <div className="grid grid-cols-2 gap-2">
                                        {mission.fixData?.imageUrl && (
                                            <div className="relative group">
                                                <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">BEFORE</div>
                                                <img src={mission.fixData.imageUrl} alt="Before" className="w-full h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                                            </div>
                                        )}
                                        <div className="relative group">
                                            <div className="absolute top-2 left-2 bg-emerald-600/80 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">AFTER</div>
                                            <img src={proofImage} alt="Proof" className="w-full h-32 object-cover rounded-lg border-2 border-emerald-500" />
                                        </div>
                                    </div>

                                    {isLoading ? (
                                        <div className="text-center text-sm text-slate-500 animate-pulse flex flex-col items-center gap-2">
                                            <Sparkles className="w-6 h-6 text-cyan-500 animate-spin" />
                                            Gemini 3 Pro is verifying closure...
                                        </div>
                                    ) : verificationResult ? (
                                        <div className={`p-3 rounded-lg border text-sm ${verificationResult.isMatch ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                                            <p className="font-bold flex items-center gap-2">
                                                {verificationResult.isMatch ? <CheckCircle className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                                                {verificationResult.isMatch ? 'Verified Match' : 'Verification Failed'}
                                            </p>
                                            <p className="mt-1 opacity-90">{verificationResult.reason}</p>
                                        </div>
                                    ) : analysis ? (
                                        <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-sm">
                                            <p className="font-bold text-green-800 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> AI Verified</p>
                                            <p className="text-green-700 mt-1">Context match: {analysis.category}</p>
                                        </div>
                                    ) : null}

                                    <button onClick={() => setProofImage(null)} className="text-xs text-red-400 hover:text-red-500 underline w-full text-center">Retake Photo</button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- LIFE SKILL CHECKLIST FLOW --- */}
                    {mission.type === MissionType.LIFE_SKILL && (
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                            {isThinking ? (
                                <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-2">
                                    <BrainCircuit className="w-8 h-8 text-violet-500 animate-pulse" />
                                    <span>Gemini is generating your lesson...</span>
                                </div>
                            ) : skillLesson ? (
                                <>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-bold text-lg dark:text-white">{skillLesson.title}</h3>
                                        {/* Real-Time Teacher Toggle */}
                                        <button
                                            onClick={toggleLiveTutor}
                                            className={`p-2 rounded-full transition-colors ${liveStatus === 'connected' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'}`}
                                            title="Start AI Tutor"
                                        >
                                            {liveStatus === 'connected' ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    {liveStatus === 'connected' && (
                                        <div className="bg-slate-900 text-white p-3 rounded-lg mb-4 text-xs flex items-center gap-2">
                                            <Volume2 className="w-4 h-4 animate-pulse" />
                                            Gemini Tutor listening... Ask questions!
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Learning Steps</h4>
                                            <ul className="list-decimal list-inside text-sm text-slate-700 dark:text-slate-300 space-y-2 pl-2">
                                                {skillLesson.steps.map((step, i) => <li key={i}>{step}</li>)}
                                            </ul>
                                        </div>
                                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
                                            <h4 className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-3">Verification Checklist</h4>
                                            <div className="space-y-3">
                                                {skillLesson.checklist.map((item, i) => (
                                                    <div key={i} onClick={() => toggleChecklist(i)} className="flex items-start gap-3 cursor-pointer">
                                                        {checklistState[i] ? <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" /> : <Square className="w-5 h-5 text-emerald-400 shrink-0" />}
                                                        <span className={`text-sm ${checklistState[i] ? 'text-emerald-900 dark:text-emerald-200 line-through opacity-70' : 'text-emerald-800 dark:text-emerald-300'}`}>{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : null}
                        </div>
                    )}

                    {/* --- LONELY MINUTES FLOW --- */}
                    {mission.type === MissionType.LONELY_MINUTES && (
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h3 className="font-bold text-lg mb-2 dark:text-white">Conversation Guide</h3>
                            <div className="space-y-2 mb-4">
                                {conversationStarters.length > 0 ? conversationStarters.map((starter, i) => (
                                    <div key={i} className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg text-sm italic">"{starter}"</div>
                                )) : <p className="text-sm dark:text-slate-400">Loading prompts...</p>}
                            </div>
                        </div>
                    )}

                    <button
                        disabled={
                            (mission.type === MissionType.FIX_BOUNTY && !proofImage) ||
                            (mission.type === MissionType.LIFE_SKILL && (!skillLesson || checklistState.some(c => !c)))
                        }
                        onClick={handleComplete}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <Send className="w-6 h-6 fill-current relative z-10" />
                        <span className="relative z-10">{mission.type === MissionType.LIFE_SKILL ? 'Claim Credential' : 'Complete Mission'}</span>
                    </button>

                    {/* Supervisor Signature Button (Optional) */}
                    {!supervisorSignature ? (
                        <button
                            onClick={() => setShowSignaturePad(true)}
                            className="w-full text-xs text-slate-400 font-bold uppercase tracking-wider hover:text-indigo-500 transition-colors py-2"
                        >
                            + Add Supervisor Signature
                        </button>
                    ) : (
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">Supervisor Signed</span>
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                            </div>
                            <button onClick={() => setSupervisorSignature(null)} className="text-xs text-red-400 hover:text-red-500 underline">Remove</button>
                        </div>
                    )}
                </div>
            );
        }

        if (status === MissionStatus.VERIFIED) {
            return (
                <ImpactReceipt
                    mission={pendingCompletion || mission}
                    onClose={() => onComplete(pendingCompletion || mission)}
                />
            );
        }

        return null;
    };

    return (
        <div className="fixed inset-0 bg-slate-50 dark:bg-slate-900 z-50 overflow-y-auto transition-colors duration-200">
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-slate-200" />
                    </button>
                    <div>
                        <span className="text-xs font-bold text-slate-400 uppercase">{mission.type.replace('_', ' ')}</span>
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">{mission.title}</h1>
                    </div>
                </div>
                <button onClick={handleShare} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 transition-colors">
                    <Share2 className="w-5 h-5" />
                </button>
            </div>

            <div className="p-4 pb-24 max-w-lg mx-auto">
                {mission.fixData?.imageUrl && (
                    <img src={mission.fixData.imageUrl} alt="Mission Context" className="w-full h-48 object-cover rounded-xl mb-4 shadow-sm" />
                )}

                {renderContent()}

                {/* Guardian Safety Timer */}
                {(mission.type === MissionType.LONELY_MINUTES || mission.type === MissionType.MEDICAL_NEED) && (
                    <GuardianTimer
                        isActive={status === MissionStatus.IN_PROGRESS}
                        initialMinutes={45}
                        onExpire={() => addToast('error', 'SAFETY ALERT', 'Guardian Timer Expired. Auto-notifying emergency contacts.')}
                    />
                )}

                <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 text-xs">
                    <Shield className="w-3 h-3" />
                    <span>Secured by Community Hero Trust Layer</span>
                </div>
            </div>

            {/* Rating Modal */}
            <RatingModal
                isOpen={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                onSubmit={handleRatingSubmit}
                type="HOST"
                targetName={mission.verifiedSource ? "Verified Host" : "Community Host"}
            />

            {/* Signature Pad */}
            {showSignaturePad && (
                <SignaturePad
                    onSave={(signature) => {
                        setSupervisorSignature(signature);
                        setShowSignaturePad(false);
                        addToast('success', 'Signature Saved', 'Supervisor verification attached.');
                    }}
                    onCancel={() => setShowSignaturePad(false)}
                />
            )}
        </div>
    );
};

export default MissionDetail;