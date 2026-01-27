import React, { useState, useRef, useEffect } from 'react';
import { Mission, MissionType, MissionStatus } from './types';
import { INITIAL_MISSIONS, CURRENT_USER, INITIAL_RESOURCES } from './constants';
import MissionCard from './components/MissionCard';
import MissionDetail from './components/MissionDetail';
import CreateFixReport from './components/CreateFixReport';
import MapView from './components/MapView';
import MissionBundleCard from './components/MissionBundleCard';
import Leaderboard from './components/Leaderboard';
import LoginScreen from './components/LoginScreen';
import CreativeStudio from './components/CreativeStudio';
import Toast, { ToastMessage } from './components/Toast';
import HelpModal from './components/HelpModal';
import HourTracker from './components/HourTracker';
import { MissionCardSkeleton } from './components/Skeleton';
import { generateLifeSkillLesson, LiveSession, decomposeComplexProject } from './services/geminiService';
import DirectoryView from './components/DirectoryView';
import ProfileView from './components/ProfileView';
import Sidebar from './components/Sidebar';
import CounselorDashboard from './components/CounselorDashboard';
import MedimateView from './components/MedimateView';
// ... existing imports ...
import { Map as MapIcon, User, Plus, Home, ShieldCheck, Wifi, WifiOff, Wallet, TrendingUp, Sparkles, List, Trophy, LayoutDashboard, HelpCircle, LogOut, Paintbrush, Activity, Mic, MicOff, BrainCircuit, Moon, Sun, Award, Search, Users, ArrowUpDown, Flame } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import PageTransition from './components/PageTransition';
import WelcomeHero from './components/WelcomeHero';
import MarathonPlanReview from './components/MarathonPlanReview';

import { auth } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getMissions, subscribeToMissions, seedMissions } from './services/firestoreService';
import { saveOfflineMission, getOfflineMissions, syncOfflineMissions } from './services/offlineStorage';
import { generateCertificate } from './utils/certificateExport';

const App: React.FC = () => {
    // Authentication State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingMissions, setIsLoadingMissions] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null); // Store real firebase user

    const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS); // Initial fallback, then replace with real
    const [activeTab, setActiveTab] = useState<'FIND' | 'MISSIONS' | 'POST' | 'VOICE' | 'PROFILE' | 'COUNSELOR' | 'MEDIMATE' | 'LEADERBOARD' | 'CREATIVE' | 'HOME'>('FIND');
    const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');
    const [sortBy, setSortBy] = useState<'NEAREST' | 'IMPACT' | 'DURATION'>('NEAREST');
    const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
    const [isCreatingReport, setIsCreatingReport] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [filter, setFilter] = useState<MissionType | 'ALL'>('ALL');
    const [isMeshMode, setIsMeshMode] = useState(false);
    const [accessibilitySettings, setAccessibilitySettings] = useState({
        highContrast: false,
        bigButtons: false
    });
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [user, setUser] = useState(CURRENT_USER);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [darkMode, setDarkMode] = useState(false);

    // Strategic Track: Marathon Agent
    const [isPlanning, setIsPlanning] = useState(false);
    const [proposedMissions, setProposedMissions] = useState<Mission[] | null>(null);
    const [marathonGoalText, setMarathonGoalText] = useState('');

    // Strategic Track: Voice Mode (Blind Support / Teacher)
    const [voiceMode, setVoiceMode] = useState<'OFF' | 'ACTIVE'>('OFF');
    const liveSessionRef = useRef<LiveSession | null>(null);

    // Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAuthenticated(true);
                setCurrentUser(user);
                // Update local user state with real data if possible
                setUser(prev => ({ ...prev, name: user.displayName || 'Hero', avatarUrl: user.photoURL || prev.avatarUrl }));
                addToast('success', 'Signed In', `Welcome back, ${user.displayName}!`);
            } else {
                setIsAuthenticated(false);
                setCurrentUser(null);
            }
        });

        // Gamification: Sticky Daily Streak Logic
        const checkStreak = () => {
            const now = new Date();
            const lastLogin = new Date(user.lastLoginDate);
            const diffTime = Math.abs(now.getTime() - lastLogin.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // If last login was > 1 day ago (yesterday), increment. 
            // If > 2 days, reset.
            // Simplified for MVP: If lastLoginDate is "yesterday" (mocked in constants), we increment.

            // In a real app, strict date comparison is needed.
            if (user.streak === 12 && diffDays <= 2) {
                // Mock transition from 12 -> 13
                setTimeout(() => {
                    setUser(prev => ({
                        ...prev,
                        streak: prev.streak + 1,
                        lastLoginDate: new Date().toISOString()
                    }));
                    addToast('success', 'Daily Streak!', `${user.streak + 1} days in a row! Keep it up! 🔥`);
                }, 2000);
            }
        };
        checkStreak();

        return () => unsubscribe();
    }, []);

    // Offline / Mesh Mode Logic
    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            setIsMeshMode(false);
            addToast('success', 'Back Online', 'Syncing offline missions...');

            // Auto-sync
            const offlineMissions = getOfflineMissions();
            if (offlineMissions.length > 0) {
                // In a real app we would call an API sync. 
                // Here we just re-process them locally
                offlineMissions.forEach(m => handleMissionComplete(m, true)); // true = isSync
                localStorage.removeItem('community_offline_missions'); // Clear after sync
                addToast('success', 'Sync Complete', `${offlineMissions.length} missions uploaded.`);
            }
        };

        const handleOffline = () => {
            setIsOffline(true);
            setIsMeshMode(true);
            addToast('error', 'Mesh Mode Active', 'You define the network. Missions will save offline.');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Real-time Missions Listener
    useEffect(() => {
        if (!isAuthenticated || isOffline) return; // Don't fetch if offline
        setIsLoadingMissions(true);
        const unsubscribe = subscribeToMissions((realMissions) => {
            if (realMissions.length > 0) {
                setMissions(realMissions);
            }
            setIsLoadingMissions(false);
        });
        return () => unsubscribe();
    }, [isAuthenticated, isOffline]);

    // Toast Helper ...
    const addToast = (type: 'success' | 'error', title: string, message: string) => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, type, title, message }]);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const handleLogin = (provider?: string) => {
        // Handled by Auth Listener now
    };

    const handleLogout = async () => {
        await signOut(auth);
        setActiveTab('FIND');
        toggleVoiceMode(true);
    };

    const handleDemoTour = () => {
        setIsAuthenticated(true);
        addToast('success', 'Demo Tour Started', 'Welcome to Community Hero! Try clicking on a mission.');
    };

    // Toggle Voice/Blind Mode (Concept 5)
    const toggleVoiceMode = async (forceOff = false) => {
        if (voiceMode === 'ACTIVE' || forceOff) {
            liveSessionRef.current?.disconnect();
            liveSessionRef.current = null;
            setVoiceMode('OFF');
            if (!forceOff) addToast('success', 'Voice Mode Off', 'Standard interface active.');
        } else {
            setVoiceMode('ACTIVE');
            liveSessionRef.current = new LiveSession();
            addToast('success', 'Voice Mode Active', 'Concept 5: Blind Support & Voice Navigation Active.');
            await liveSessionRef.current.connect((status) => {
                if (status === 'error') setVoiceMode('OFF');
            }, 'BLIND_SUPPORT');
        }
    };

    // Strategic Track: Marathon Agent (Decompose Goals)
    const handleMarathonGoal = async (goal: string) => {
        setIsPlanning(true);
        setMarathonGoalText(goal);
        addToast('success', 'Marathon Agent Active', 'Gemini 3 Pro is decomposing your project...');

        const subMissions = await decomposeComplexProject(goal);

        if (subMissions.length > 0) {
            const newMissions: Mission[] = subMissions.map((sm: any, idx: number) => ({
                id: `marathon-${Date.now()}-${idx}`,
                type: sm.type as MissionType,
                title: sm.title,
                description: sm.description,
                location: 'Project Location',
                distance: '0.1 mi',
                reward: sm.reward || 100,
                status: MissionStatus.OPEN,
                urgency: sm.urgency || 'MEDIUM',
                timeEstimate: '1 hr'
            }));

            setProposedMissions(newMissions);
            setIsCreatingReport(false);
        } else {
            addToast('error', 'Planning Failed', 'Could not break down the project. Try again.');
        }
        setIsPlanning(false);
    };

    const handleConfirmPlan = (finalMissions: Mission[]) => {
        setMissions(prev => [...finalMissions, ...prev]);
        setProposedMissions(null);
        addToast('success', 'Project Launched', `Created ${finalMissions.length} micro-missions from your strategic plan.`);
    };

    const calculateHours = (timeEstimate: string): number => {
        // Parse time estimates like "5 min", "30 min", "2 hrs"
        const match = timeEstimate.match(/(\d+)\s*(min|hr|hour)/i);
        if (!match) return 0;

        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();

        if (unit.includes('hr') || unit.includes('hour')) {
            return value;
        } else {
            return Math.round(value / 60 * 10) / 10; // Convert minutes to hours, round to 1 decimal
        }
    };

    // Accessibility Effect
    useEffect(() => {
        if (accessibilitySettings.highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    }, [accessibilitySettings.highContrast]);

    // Handle Mission Complete
    const handleMissionComplete = async (completedMission: Mission, isSync = false) => {
        if (isOffline && !isSync) {
            saveOfflineMission(completedMission);
            addToast('success', 'Saved Offline', 'Mission queued for upload via Mesh Network.');
            // Optimistically update UI
            setMissions(prev => prev.map(m =>
                m.id === completedMission.id ? { ...m, status: MissionStatus.VERIFIED } : m
            ));
            return;
        }

        setMissions(prev => prev.map(m =>
            m.id === completedMission.id ? { ...m, status: MissionStatus.VERIFIED } : m
        ));

        const xpGained = completedMission.reward;

        // Calculate hours for students
        let hoursEarned = 0;
        if (user.role === 'STUDENT' && user.studentData) {
            hoursEarned = calculateHours(completedMission.timeEstimate);

            // Auto-verify simple missions (Fix Bounty, Life Skill)
            const autoVerifyTypes = ['FIX_BOUNTY', 'LIFE_SKILL'];
            const shouldAutoVerify = autoVerifyTypes.includes(completedMission.type);

            setUser(prev => ({
                ...prev,
                trustScore: Math.min(100, prev.trustScore + 5),
                impactCredits: prev.impactCredits + xpGained,
                studentData: prev.studentData ? {
                    ...prev.studentData,
                    verifiedHours: shouldAutoVerify
                        ? prev.studentData.verifiedHours + hoursEarned
                        : prev.studentData.verifiedHours,
                    pendingHours: shouldAutoVerify
                        ? prev.studentData.pendingHours
                        : prev.studentData.pendingHours + hoursEarned
                } : prev.studentData
            }));

            addToast('success', 'Mission Verified!',
                `Earned ${xpGained} Credits + ${hoursEarned.toFixed(1)} volunteer ${shouldAutoVerify ? 'verified' : 'pending'} hours!`
            );
        } else {
            setUser(prev => ({
                ...prev,
                trustScore: Math.min(100, prev.trustScore + 5),
                impactCredits: prev.impactCredits + xpGained
            }));

            addToast('success', 'Mission Verified!', `You earned ${xpGained} Impact Credits & 5 Trust Points.`);
        }

        setSelectedMission(null);
    };

    const handleReportSubmit = (newMission: Mission) => {
        setMissions([newMission, ...missions]);
        setIsCreatingReport(false);
        addToast('success', 'Report Submitted', 'Your bounty has been posted to the community map.');
    };

    const filteredMissions = missions.filter(m => filter === 'ALL' || m.type === filter);

    // Sort Missions
    const sortedMissions = [...filteredMissions].sort((a, b) => {
        if (sortBy === 'IMPACT') return (b.reward || 0) - (a.reward || 0);
        if (sortBy === 'DURATION') {
            const getMins = (t: string) => {
                if (t.includes('hour')) return parseInt(t) * 60;
                return parseInt(t) || 0;
            };
            return getMins(a.timeEstimate) - getMins(b.timeEstimate);
        }
        // NEAREST (Default)
        const getDist = (d: string) => d === 'N/A' ? 999 : parseFloat(d);
        return getDist(a.distance) - getDist(b.distance);
    });

    // ... inside App component
    if (!isAuthenticated) {
        return <LoginScreen onLogin={handleLogin} onDemoTour={handleDemoTour} />;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row w-full h-screen overflow-hidden font-sans relative transition-colors duration-200">

            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none md:absolute md:top-6 md:right-6">
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto">
                        <Toast toast={t} onDismiss={removeToast} />
                    </div>
                ))}
            </div>

            {/* Voice Mode Toggle (Floating) */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] md:hidden">
                <button
                    onClick={() => toggleVoiceMode()}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-xl font-bold text-xs transition-all ${voiceMode === 'ACTIVE' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-900 text-white'}`}
                >
                    {voiceMode === 'ACTIVE' ? <><Mic className="w-4 h-4" /> Live: On</> : <><MicOff className="w-4 h-4" /> Voice</>}
                </button>
            </div>

            {/* Desktop Sidebar */}
            <Sidebar
                user={user}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                setIsCreatingReport={setIsCreatingReport}
                activeVoiceMode={voiceMode === 'ACTIVE'}
                isMeshMode={isMeshMode}
                setIsMeshMode={setIsMeshMode}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                setShowHelp={setShowHelp}
                onLogout={handleLogout}
                addToast={addToast}
                setUser={setUser}
            />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen md:h-full relative overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors">

                {/* Mobile Header */}
                <header className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center sticky top-0 z-10 shrink-0">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Community Hero</h1>
                    <div className="flex items-center gap-2">
                        <div className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-green-600" /> <span className="dark:text-white">{user.trustScore}</span>
                        </div>
                        <div className="bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 text-orange-600 dark:text-orange-400">
                            <Flame className="w-3 h-3" /> <span>{user.streak}</span>
                        </div>
                        <button onClick={() => setActiveTab('PROFILE')}>
                            <img src={user.avatarUrl} className="w-8 h-8 rounded-full" />
                        </button>
                    </div>
                </header>

                {isMeshMode && (
                    <div className="bg-orange-500 text-white text-xs font-bold text-center py-1 flex justify-center items-center gap-2 animate-pulse shrink-0">
                        <WifiOff className="w-3 h-3" /> MESH MODE ACTIVE: DISASTER RECOVERY PROTOCOL
                    </div>
                )}

                {/* Main Content with AnimatePresence */}
                <div className="flex-1 overflow-hidden relative font-sans h-[100dvh] flex flex-col md:h-screen">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="w-full h-full flex flex-col"
                        >
                            {activeTab === 'FIND' && (
                                <div className="h-full flex flex-col p-4 w-full">
                                    <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">Directory</h2>
                                    <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <DirectoryView resources={INITIAL_RESOURCES} onResourceClick={(r) => {
                                            addToast('success', 'Resource Selected', r.name);
                                        }} />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'MISSIONS' && (
                                <div className="h-full flex flex-col">
                                    {/* Header */}
                                    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
                                                <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === 'ALL' ? 'bg-slate-900 text-white dark:bg-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>All</button>
                                                {/* Concept 2: Medimate */}
                                                <button onClick={() => setFilter(MissionType.MEDICAL_NEED)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === MissionType.MEDICAL_NEED ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>Medimate</button>
                                                <button onClick={() => setFilter(MissionType.FIX_BOUNTY)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === MissionType.FIX_BOUNTY ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>Fixes</button>
                                                <button onClick={() => setFilter(MissionType.FOOD_FIT)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === MissionType.FOOD_FIT ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>Food</button>
                                            </div>
                                            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 shrink-0 gap-1">
                                                <button
                                                    onClick={() => {
                                                        if (sortBy === 'NEAREST') setSortBy('IMPACT');
                                                        else if (sortBy === 'IMPACT') setSortBy('DURATION');
                                                        else setSortBy('NEAREST');
                                                    }}
                                                    className="p-2 rounded-md text-slate-400 hover:text-indigo-500 hover:bg-white dark:hover:bg-slate-700 transition-all relative group"
                                                >
                                                    <ArrowUpDown className="w-4 h-4" />
                                                    <span className="absolute top-full right-0 mt-1 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50">
                                                        Sort: {sortBy}
                                                    </span>
                                                </button>
                                                <div className="w-px bg-slate-200 dark:bg-slate-700 my-1 mx-0.5"></div>
                                                <button onClick={() => setViewMode('LIST')} className={`p-2 rounded-md transition-all ${viewMode === 'LIST' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                                    <List className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setViewMode('MAP')} className={`p-2 rounded-md transition-all ${viewMode === 'MAP' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                                    <MapIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </header>

                                    <div className="flex-1 overflow-y-auto relative">
                                        {viewMode === 'LIST' ? (
                                            <div className="p-4 space-y-2 pb-24 md:pb-6">
                                                {/* Welcome Hero (Pro Max) */}
                                                <WelcomeHero
                                                    user={user}
                                                    onMarathonClick={() => setIsCreatingReport(true)}
                                                />

                                                <div className="flex justify-between items-center mb-2">
                                                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Nearby Missions</h2>
                                                    <span className="text-xs text-slate-400">{filteredMissions.length} active</span>
                                                </div>

                                                {isLoadingMissions ? (
                                                    <div className="space-y-3">
                                                        <MissionCardSkeleton />
                                                        <MissionCardSkeleton />
                                                        <MissionCardSkeleton />
                                                    </div>
                                                ) : (
                                                    <>
                                                        {(() => {
                                                            // Smart Task Batching Logic
                                                            const processedMissionIds = new Set<string>();
                                                            const bundles: (Mission | Mission[])[] = [];

                                                            sortedMissions.forEach(mission => {
                                                                if (processedMissionIds.has(mission.id)) return;

                                                                // Bundle by Location (Idea for Phase 6)
                                                                const bundle = sortedMissions.filter(m =>
                                                                    m.id !== mission.id &&
                                                                    !processedMissionIds.has(m.id) &&
                                                                    m.location === mission.location
                                                                );

                                                                if (bundle.length > 0) {
                                                                    bundles.push([mission, ...bundle]);
                                                                    processedMissionIds.add(mission.id);
                                                                    bundle.forEach(b => processedMissionIds.add(b.id));
                                                                } else {
                                                                    bundles.push(mission);
                                                                    processedMissionIds.add(mission.id);
                                                                }
                                                            });

                                                            return bundles.map((item, idx) => (
                                                                Array.isArray(item) ? (
                                                                    <MissionBundleCard
                                                                        key={`bundle-${idx}`}
                                                                        missions={item}
                                                                        onStartBundle={(ms) => {
                                                                            addToast('success', 'Bundle Started', `Started ${ms.length} missions at ${ms[0].location}`);
                                                                            setSelectedMission(ms[0]);
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <MissionCard key={item.id} mission={item} onClick={setSelectedMission} />
                                                                )
                                                            ));
                                                        })()}

                                                        {filteredMissions.length === 0 && (
                                                            <div className="text-center py-12 text-slate-400">
                                                                <p>No missions found in this filter.</p>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="w-full h-full relative">
                                                <div className="absolute top-4 left-4 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-2 border border-slate-200 dark:border-slate-700 dark:text-white">
                                                    <MapIcon className="w-3 h-3 text-blue-500" /> Live Community Map
                                                </div>
                                                <MapView missions={filteredMissions} resources={INITIAL_RESOURCES} onMissionClick={setSelectedMission} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'VOICE' && (
                                <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-8 bg-slate-900 text-white relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-slate-900 pointer-events-none"></div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>

                                    <div className="relative z-10">
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                            className="w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(79,70,229,0.4)] mb-6 cursor-pointer hover:scale-105 transition-transform"
                                        >
                                            <Mic className="w-12 h-12 text-white" />
                                        </motion.div>

                                        <h2 className="text-2xl font-bold mb-2">Hands-Free Mode</h2>
                                        <p className="text-slate-400 max-w-xs mx-auto mb-8">
                                            Experience CommunityOS without touching your screen. Just say "Hey Community" to start.
                                        </p>

                                        <div className="flex flex-wrap justify-center gap-3">
                                            <span className="bg-white/10 px-3 py-1.5 rounded-full text-xs font-medium border border-white/10">"Find cleanup missions"</span>
                                            <span className="bg-white/10 px-3 py-1.5 rounded-full text-xs font-medium border border-white/10">"Report a pothole"</span>
                                            <span className="bg-white/10 px-3 py-1.5 rounded-full text-xs font-medium border border-white/10">"Check my progress"</span>
                                        </div>
                                    </div>

                                    <button onClick={() => setActiveTab('HOME')} className="absolute top-6 left-6 text-slate-400 hover:text-white z-20 font-bold text-sm">
                                        Back
                                    </button>
                                </div>
                            )}

                            {activeTab === 'LEADERBOARD' && <Leaderboard />}

                            {/* New Creative Studio Tab */}
                            {activeTab === 'CREATIVE' && <CreativeStudio onClose={() => setActiveTab('HOME')} />}

                            {activeTab === 'PROFILE' && (
                                <ProfileView
                                    user={user}
                                    missions={missions}
                                    onToggleDarkMode={() => setDarkMode(!darkMode)}
                                    darkMode={darkMode}
                                    onLogout={handleLogout}
                                    onShowHelp={() => setShowHelp(true)}
                                    onUpdateUser={setUser}
                                    addToast={addToast}
                                    accessibilitySettings={accessibilitySettings}
                                    onUpdateAccessibility={(settings) => setAccessibilitySettings(settings)}
                                />
                            )}

                            {activeTab === 'COUNSELOR' && <CounselorDashboard currentUser={user} />}

                            {activeTab === 'MEDIMATE' && <MedimateView user={user} onConnect={(m) => {
                                addToast('success', 'Request Sent', `You have connected with the owner of: ${m.title}`);
                            }} />}

                            {/* Floating Action Button (Mobile) */}
                            {activeTab === 'HOME' && (
                                <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 z-20">
                                    <button
                                        onClick={() => setIsCreatingReport(true)}
                                        className="bg-black dark:bg-indigo-600 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-transform active:scale-95"
                                    >
                                        <Plus className="w-6 h-6" />
                                    </button>
                                </div>
                            )}

                            {/* Mobile Bottom Nav */}
                            <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-around p-3 pb-6 shrink-0 z-20 transition-colors">
                                <button onClick={() => setActiveTab('FIND')} className={`flex flex-col items-center gap-1 ${activeTab === 'FIND' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                    <Search className="w-6 h-6" />
                                    <span className="text-[10px] font-bold">Find</span>
                                </button>
                                <button onClick={() => setActiveTab('MISSIONS')} className={`flex flex-col items-center gap-1 ${activeTab === 'MISSIONS' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                    <MapIcon className="w-6 h-6" />
                                    <span className="text-[10px] font-bold">Missions</span>
                                </button>
                                <button onClick={() => setIsCreatingReport(true)} className={`flex flex-col items-center gap-1 text-indigo-600`}>
                                    <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-full -mt-4">
                                        <Plus className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-bold">Post</span>
                                </button>
                                <button onClick={() => setActiveTab('VOICE')} className={`flex flex-col items-center gap-1 ${activeTab === 'VOICE' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                    <Mic className="w-6 h-6" />
                                    <span className="text-[10px] font-bold">Voice</span>
                                </button>
                                <button onClick={() => setActiveTab('PROFILE')} className={`flex flex-col items-center gap-1 ${activeTab === 'PROFILE' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                    <User className="w-6 h-6" />
                                    <span className="text-[10px] font-bold">Profile</span>
                                </button>
                            </div>

                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Modals/Overlays */}
                {selectedMission && (
                    <MissionDetail
                        mission={selectedMission}
                        onBack={() => setSelectedMission(null)}
                        onComplete={handleMissionComplete}
                        addToast={addToast}
                        bigButtonMode={accessibilitySettings.bigButtons}
                    />
                )}

                {isCreatingReport && (
                    <CreateFixReport
                        onClose={() => setIsCreatingReport(false)}
                        onSubmit={handleReportSubmit}
                        isMarathonMode={isPlanning}
                        onMarathonGoal={handleMarathonGoal}
                    />
                )}

                {showHelp && (
                    <HelpModal onClose={() => setShowHelp(false)} />
                )}

                {/* Marathon Plan Review Modal */}
                {proposedMissions && (
                    <MarathonPlanReview
                        goal={marathonGoalText}
                        proposedMissions={proposedMissions}
                        onConfirm={handleConfirmPlan}
                        onCancel={() => setProposedMissions(null)}
                    />
                )}

            </main>
        </div>
    );
};

export default App;