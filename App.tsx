import React, { useState, useRef, useEffect } from 'react';
import { Mission, MissionType, MissionStatus } from './types';
import { INITIAL_MISSIONS, CURRENT_USER, INITIAL_RESOURCES } from './constants';
import MissionCard from './components/MissionCard';
import MissionDetail from './components/MissionDetail';
import CreateFixReport from './components/CreateFixReport';
import MapView from './components/MapView';
import MissionBundleCard from './components/MissionBundleCard';
// Phase 5: Safety Checks
import QuickAlertButton from './components/QuickAlertButton';
import ReportIncidentModal from './components/ReportIncidentModal';
import CrisisOverlay from './components/CrisisOverlay';
import Leaderboard from './components/Leaderboard';
import LoginScreen from './components/LoginScreen';
import CreativeStudio from './components/CreativeStudio';
import Toast, { ToastMessage } from './components/Toast';
import HelpModal from './components/HelpModal';
import HourTracker from './components/HourTracker';
import { MissionCardSkeleton } from './components/Skeleton';
import { generateLifeSkillLesson, voiceManager, decomposeComplexProject } from './services/geminiService';
import { HELP_CONTENT } from './services/helpContent';

import SwarmOverlay from './components/SwarmOverlay';
import { MOCK_ACTIVE_USERS } from './constants';
import { ActiveUser, UserRole } from './types';
import { subscribeToActiveUsers, subscribeToSwarmStatus, setSwarmStatus, updateUserStatus } from './services/liveOpsService';
import { updateProfile, getUserProfile, createUserProfile } from './services/firestoreService';
import DirectoryView from './components/DirectoryView';
import LocalBroadcastModal from './components/LocalBroadcastModal';
import ProfileView from './components/ProfileView';
import Sidebar from './components/Sidebar';
import CounselorDashboard from './components/CounselorDashboard';
import MedimateView from './components/MedimateView';
import AssistantView from './components/AssistantView';
import ChatWidget from './components/ChatWidget';
// ... existing imports ...
import { Map as MapIcon, User, Plus, Home, ShieldCheck, Wifi, WifiOff, Wallet, TrendingUp, Sparkles, List, Trophy, LayoutDashboard, HelpCircle, LogOut, Paintbrush, Activity, Mic, MicOff, BrainCircuit, Moon, Sun, Award, Search, Users, ArrowUpDown, Flame, Shield, Settings, Bell, Menu, X, ChevronRight, BookmarkPlus, Star, Target, ChevronDown, MapPin, Radio } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import PageTransition from './components/PageTransition';
import WelcomeHero from './components/WelcomeHero';
import MarathonPlanReview from './components/MarathonPlanReview';
import OnboardingFlow from './components/Onboarding/OnboardingFlow';

import { auth } from './firebaseConfig';
import { onAuthStateChanged, signOut, signInAnonymously } from 'firebase/auth';
import { getMissions, subscribeToMissions, seedMissions } from './services/firestoreService';
import { saveOfflineMission, getOfflineMissions, syncOfflineMissions } from './services/offlineStorage';
import { generateCertificate } from './utils/certificateExport';
import MissionActionList from './components/Home/MissionActionList';
import { fetchCityDataMissions } from './services/cityDataService';

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
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [darkMode, setDarkMode] = useState(false);

    // Strategic Track: Marathon Agent
    const [isPlanning, setIsPlanning] = useState(false);
    const [proposedMissions, setProposedMissions] = useState<Mission[] | null>(null);
    const [marathonGoalText, setMarathonGoalText] = useState('');

    // X-Factor: Swarm / Live Ops
    const [isSwarmActive, setIsSwarmActive] = useState(false);
    const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]); // Real active users

    // Phase 7: Mesh Mode State
    const [showLocalBroadcast, setShowLocalBroadcast] = useState(false);
    const meshSignalStrength = 75; // Mock signal strength

    // 1. Subscribe to Swarm Status (Global)
    // 1. Subscribe to Swarm Status (Global)
    useEffect(() => {
        if (!isAuthenticated) return;

        if (isDemoMode) {
            // Mock swarm status for demo
            return;
        }

        const unsubscribe = subscribeToSwarmStatus((status) => {
            setIsSwarmActive(status);
            if (status) {
                // Optional: Alert only on rising edge, or rely on UI to show it
            }
        });
        return () => unsubscribe();
    }, [isAuthenticated, isDemoMode]);

    // 2. Subscribe to Active Users
    // 2. Subscribe to Active Users
    useEffect(() => {
        if (!isAuthenticated) return;

        if (isDemoMode) {
            // Use mock data for demo
            setActiveUsers(MOCK_ACTIVE_USERS);
            return;
        }

        const unsubscribe = subscribeToActiveUsers((users) => {
            // Filter out current user from the view if desired, or show them too
            // showing all for now (including self, to confirm it works)
            setActiveUsers(users);
        });
        return () => unsubscribe();
    }, [isAuthenticated, isDemoMode]);

    // 2.1 Fetch Real City Data (Phase 3)
    useEffect(() => {
        const loadCityMissions = async () => {
            // Default to SF for demo if no live location yet
            // In real app, would use `user.location` or geolocation
            const lat = 37.7749;
            const lng = -122.4194;

            try {
                const cityMissions = await fetchCityDataMissions(lat, lng);
                setMissions(prev => {
                    // Avoid duplicates if React Strict Mode runs twice
                    const existingIds = new Set(prev.map(m => m.id));
                    const newMissions = cityMissions.filter(m => !existingIds.has(m.id));
                    return [...prev, ...newMissions];
                });
            } catch (e) {
                console.error("Failed to load city data", e);
            }
        };

        // Load immediately for now
        loadCityMissions();
    }, []);

    // 2.2 Global Voice Mode Listener
    useEffect(() => {
        const unsubscribe = voiceManager.onStatusChange((status) => {
            setVoiceMode(status === 'connected' ? 'ACTIVE' : 'OFF');
        });
        return () => unsubscribe();
    }, []);

    // 3. Track & Publish Own Location

    useEffect(() => {
        if (!isAuthenticated || !user || !user.id || isDemoMode) return;

        const updateLocation = () => {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const { latitude, longitude } = position.coords;
                    // Only update if we have a valid user ID to prevent permission errors
                    if (user.id) {
                        updateUserStatus(user.id, {
                            id: user.id,
                            location: { lat: latitude, lng: longitude },
                            role: user.role || UserRole.NEIGHBOR,
                            status: isSwarmActive ? 'RESPONDING' : 'IDLE',
                            lastActive: new Date().toISOString()
                        });
                    }
                }, (error) => {
                    console.log("Geo error or denied:", error);
                }, { enableHighAccuracy: true });
            }
        };

        // Update immediately
        updateLocation();

        // Then every 10 seconds
        const interval = setInterval(updateLocation, 10000);
        return () => clearInterval(interval);
    }, [user, isSwarmActive, isAuthenticated, isDemoMode]);


    const handleSwarmToggle = () => {
        // Toggle Global Swarm Satus
        const newState = !isSwarmActive;

        if (isDemoMode) {
            setIsSwarmActive(newState);
            addToast('success', newState ? 'Swarm Initiated (Demo)' : 'Swarm Stand Down (Demo)', 'Simulation active.');
            return;
        }

        setSwarmStatus(newState);

        if (newState) {
            addToast('error', 'SWARM PROTOCOL INITIATED', 'Mobilizing all nearby units.');
            setActiveTab('MISSIONS'); // Auto-switch context
            setViewMode('MAP');
        } else {
            addToast('success', 'Stand Down', 'Crisis resolved. Returning to normal ops.');
        }
    };

    // Strategic Track: Voice Mode (Blind Support / Teacher)
    const [voiceMode, setVoiceMode] = useState<'OFF' | 'ACTIVE'>(() =>
        voiceManager.getStatus() === 'connected' ? 'ACTIVE' : 'OFF'
    );
    const liveSessionRef = useRef<any>(null); // Keep for ref compatibility if used elsewhere, but will be null
    // Phase 5: Safety Modal
    const [showReportModal, setShowReportModal] = useState(false);
    // Phase 6: Crisis Mode Global State
    const [isCrisisMode, setIsCrisisMode] = useState(false);

    // Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // setIsAuthenticated(true); // Moved to after profile load to prevent race condition
                setCurrentUser(firebaseUser);

                // Fetch real profile
                let profile = await getUserProfile(firebaseUser.uid);

                if (!profile) {
                    // New User -> Create Profile
                    const signupRole = localStorage.getItem('signup_role');
                    const initialRole = signupRole === 'STUDENT' ? UserRole.STUDENT : UserRole.NEIGHBOR;

                    profile = {
                        ...CURRENT_USER, // Use defaults
                        id: firebaseUser.uid,
                        name: firebaseUser.displayName || 'Neighbor',
                        email: firebaseUser.email || null, // Firestore doesn't like undefined
                        avatarUrl: firebaseUser.photoURL || CURRENT_USER.avatarUrl,
                        role: initialRole,
                        lastLoginDate: new Date().toISOString()
                    };
                    await createUserProfile(profile);
                    localStorage.removeItem('signup_role'); // Clean up
                }

                setUser(profile);
                setIsAuthenticated(true);
                addToast('success', 'Signed In', `Welcome back, ${profile.name}!`);
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
        if (!isAuthenticated || isOffline || isDemoMode) return; // Don't fetch if offline or demo
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
        const id = Date.now().toString() + Math.random().toString().slice(2);
        setToasts(prev => [...prev, { id, type, title, message }]);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // Phase 7: Handle Local Mesh Broadcast
    const handleLocalBroadcast = (broadcast: any) => {
        // In production, this would send the broadcast to the mesh network
        const broadcastId = `broadcast_${Date.now()}`;
        console.log('Local Broadcast Sent:', { ...broadcast, id: broadcastId });

        addToast('success', '📡 Broadcast Sent', `Your ${broadcast.type.replaceAll('_', ' ').toLowerCase()} message was sent to ${Math.floor(meshSignalStrength / 10)} nearby nodes.`);
    };

    const handleLogin = (provider?: string) => {
        // Handled by Auth Listener now
    };

    const handleLogout = async () => {
        if (isDemoMode) {
            setIsDemoMode(false);
            setIsAuthenticated(false);
            setCurrentUser(null);
            setUser(CURRENT_USER); // Reset to default mock user
            addToast('success', 'Demo Ended', 'Thanks for testing!');
        } else {
            await signOut(auth);
        }
        setActiveTab('FIND');
        toggleVoiceMode(true);
    };

    const handleDemoTour = async () => {
        try {
            await signInAnonymously(auth);
            setIsDemoMode(false);
            addToast('success', 'Demo Tour Started', 'Welcome to Community Hero! Try clicking on a mission.');
        } catch (error: any) {
            console.error("Demo login failed", error);
            if (error.code === 'auth/admin-restricted-operation') {
                // Fallback to local demo mode
                setIsAuthenticated(true);
                setIsDemoMode(true);
                addToast('success', 'Demo Mode (Offline)', 'Backend disabled. Running simulation.');
            } else {
                addToast('error', 'Demo Failed', 'Could not start demo mode.');
            }
        }
    };

    // Toggle Voice/Blind Mode (Concept 5)
    const toggleVoiceMode = async (forceOff = false) => {
        if (voiceMode === 'ACTIVE' || forceOff) {
            voiceManager.disconnect();
            if (!forceOff) addToast('success', 'Voice Mode Off', 'Standard interface active.');
        } else {
            addToast('success', 'Voice Mode Active', 'Connecting to Gemini Live...');

            // Gather Context
            const context = {
                user: user,
                location: user.location,
                activeTab: activeTab,
                viewMode: viewMode,
                filter: filter === 'ALL' ? undefined : filter,
                isSwarmActive: isSwarmActive,
                missions: filteredMissions.slice(0, 5), // Pass top 5 relevant missions to save tokens
                activeUsersCount: activeUsers.length,
                localTime: new Date().toLocaleTimeString(),
                helpContent: HELP_CONTENT
            };

            await voiceManager.connect('TEACHER', null, context);
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
    // Onboarding State
    const [hasOnboarded, setHasOnboarded] = useState(() => {
        return localStorage.getItem('communityos_has_onboarded') === 'true';
    });

    const handleOnboardingComplete = (data: { role: 'VOLUNTEER' | 'BENEFICIARY'; location: GeolocationPosition }) => {
        localStorage.setItem('communityos_has_onboarded', 'true');
        localStorage.setItem('communityos_role', data.role);
        setHasOnboarded(true);

        // Router Logic based on Role
        if (data.role === 'BENEFICIARY') {
            setActiveTab('FIND');
        } else {
            setActiveTab('HOME');
        }

        // Mock "Demo" Login for now to enable app features if we want to show full UI
        // In a real app, this would stay unauthenticated until they sign up.
        // For this prototype, we'll auto-login as the demo user to show the "Must-Have" experience immediately.
        handleLogin();
    };

    if (!hasOnboarded) {
        return <OnboardingFlow onComplete={handleOnboardingComplete} />;
    }

    if (!isAuthenticated) {
        // Fallback if they cleared storage but are not logged in, or if we want to keep LoginScreen accessible?
        // For "Frictionless", we want to auto-login or show guest view.
        // Let's rely on the handleOnboardingComplete calling handleLogin for now to keep it simple and high-impact.
        // But if they refresh and are not authenticated?
        // We should probably auto-login if hasOnboarded is true for this prototype phase.
        // Or just show LoginScreen if they manually logged out.
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

            {/* DEMO TRIGGER: Hidden in bottom left or accessible via key combo? Let's generic button for now in bottom left if sidebar is collapsed */}
            <div className="fixed bottom-4 left-4 z-[9999] opacity-0 hover:opacity-100 transition-opacity">
                <button
                    onClick={handleSwarmToggle}
                    className="bg-red-900 text-white text-xs px-2 py-1 rounded"
                >
                    Simulate Crisis
                </button>
            </div>

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
                            {activeTab === 'HOME' && (
                                <MissionActionList
                                    missions={filteredMissions} // Or just sortedMissions if we want all nearby
                                    user={user}
                                    onMissionClick={setSelectedMission}
                                    onMarathonClick={() => setIsCreatingReport(true)}
                                />
                            )}

                            {activeTab === 'FIND' && (
                                <div className="h-full flex flex-col p-4 w-full">
                                    <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">Directory</h2>
                                    <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <DirectoryView
                                            resources={INITIAL_RESOURCES}
                                            onSelectResource={(r) => {
                                                addToast('success', 'Resource Selected', r.name);
                                            }}
                                            meshMode={isSwarmActive}
                                            meshSignalStrength={meshSignalStrength}
                                        />
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
                                                <MapView
                                                    missions={filteredMissions}
                                                    resources={INITIAL_RESOURCES}
                                                    onMissionClick={setSelectedMission}
                                                    activeUsers={activeUsers}
                                                    isSwarmActive={isSwarmActive}
                                                />
                                            </div>
                                        )}
                                    </div>
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
                                    onUpdateAccessibility={setAccessibilitySettings}
                                />
                            )}

                            {activeTab === 'VOICE' && (
                                <AssistantView
                                    missions={missions}
                                    onNavigate={(tab) => setActiveTab(tab as any)}
                                    onSearchMissions={() => setActiveTab('HOME')}
                                />
                            )}

                            {activeTab === 'COUNSELOR' && <CounselorDashboard currentUser={user} />}

                            {activeTab === 'MEDIMATE' && <MedimateView user={user} onConnect={(m) => {
                                addToast('success', 'Request Sent', `You have connected with the owner of: ${m.title}`);
                            }} />}

                            {/* Floating Action Button (Desktop Only - Centered) */}
                            {activeTab === 'HOME' && (
                                <div className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
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

                {/* Floating Chat Widget (Desktop & Mobile) */}
                <ChatWidget onNavigate={(tab) => setActiveTab(tab as any)} onSearchMissions={() => {
                    setActiveTab('HOME');
                    setFilter('ALL');
                }} />

                {/* Modals/Overlays */}
                {
                    selectedMission && (
                        <MissionDetail
                            mission={selectedMission}
                            onBack={() => setSelectedMission(null)}
                            onComplete={handleMissionComplete}
                            addToast={addToast}
                            bigButtonMode={accessibilitySettings.bigButtons}
                        />
                    )
                }

                {
                    isCreatingReport && (
                        <CreateFixReport
                            onClose={() => setIsCreatingReport(false)}
                            onSubmit={handleReportSubmit}
                            isMarathonMode={isPlanning}
                            onMarathonGoal={handleMarathonGoal}
                        />
                    )
                }

                {
                    showHelp && (
                        <HelpModal onClose={() => setShowHelp(false)} />
                    )
                }

                {/* Marathon Plan Review Modal */}
                {
                    proposedMissions && (
                        <MarathonPlanReview
                            goal={marathonGoalText}
                            proposedMissions={proposedMissions}
                            onConfirm={handleConfirmPlan}
                            onCancel={() => setProposedMissions(null)}
                        />
                    )
                }

                {/* Phase 5: Safety Layer */}
                {isAuthenticated && (
                    <>
                        <QuickAlertButton
                            onEmergency={() => setIsCrisisMode(true)}
                            onReport={() => setShowReportModal(true)}
                        />
                        <ReportIncidentModal
                            isOpen={showReportModal}
                            onClose={() => setShowReportModal(false)}
                            onSubmit={(report) => addToast('success', 'Report Filed', `Incident #${report.id.slice(-4)} submitted for triage.`)}
                        />
                        <CrisisOverlay
                            isActive={isCrisisMode}
                            onExit={() => setIsCrisisMode(false)}
                            onEmergencyCall={() => addToast('error', '911 DIALED', 'Connecting to emergency services...')}
                            onReportIncident={() => {
                                setIsCrisisMode(false);
                                setShowReportModal(true);
                            }}
                        />

                        {/* Phase 7: Local Broadcast Modal & FAB */}
                        {isSwarmActive && (
                            <>
                                <LocalBroadcastModal
                                    onClose={() => setShowLocalBroadcast(false)}
                                    onSend={handleLocalBroadcast}
                                    meshSignalStrength={meshSignalStrength}
                                    userName={user.displayName}
                                    userId={user.id}
                                />

                                {!showLocalBroadcast && (
                                    <button
                                        onClick={() => setShowLocalBroadcast(true)}
                                        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-emerald-500 to-green-400 text-white rounded-full shadow-2xl hover:shadow-emerald-500/50 transition-all hover:scale-110 flex items-center justify-center z-40 group"
                                        title="Broadcast to Local Mesh"
                                    >
                                        <Radio className="w-6 h-6 animate-pulse" />
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
                                    </button>
                                )}
                            </>
                        )}
                    </>
                )}

            </main>
            {/* Swarm Overlay Component */}
            <SwarmOverlay isActive={isSwarmActive} onDeactivate={handleSwarmToggle} />
        </div>
    );
};

export default App;