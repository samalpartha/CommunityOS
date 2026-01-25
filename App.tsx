import React, { useState, useRef, useEffect } from 'react';
import { Mission, MissionType, MissionStatus } from './types';
import { INITIAL_MISSIONS, CURRENT_USER, INITIAL_RESOURCES } from './constants';
import MissionCard from './components/MissionCard';
import MissionDetail from './components/MissionDetail';
import CreateFixReport from './components/CreateFixReport';
import MapView from './components/MapView';
import Leaderboard from './components/Leaderboard';
import LoginScreen from './components/LoginScreen';
import CreativeStudio from './components/CreativeStudio';
import Toast, { ToastMessage } from './components/Toast';
import HelpModal from './components/HelpModal';
import { MissionCardSkeleton } from './components/Skeleton';
import { generateLifeSkillLesson, LiveSession, decomposeComplexProject } from './services/geminiService';
import { Map as MapIcon, User, Plus, Home, ShieldCheck, Wifi, WifiOff, Wallet, TrendingUp, Sparkles, List, Trophy, LayoutDashboard, HelpCircle, LogOut, Paintbrush, Activity, Mic, MicOff, BrainCircuit, Moon, Sun, Award } from 'lucide-react';

const App: React.FC = () => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingMissions, setIsLoadingMissions] = useState(false);
  
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [activeTab, setActiveTab] = useState<'HOME' | 'LEADERBOARD' | 'PROFILE' | 'CREATIVE'>('HOME');
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [filter, setFilter] = useState<MissionType | 'ALL'>('ALL');
  const [isMeshMode, setIsMeshMode] = useState(false);
  const [user, setUser] = useState(CURRENT_USER);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  // Strategic Track: Marathon Agent
  const [isPlanning, setIsPlanning] = useState(false);

  // Strategic Track: Voice Mode (Blind Support / Teacher)
  const [voiceMode, setVoiceMode] = useState<'OFF' | 'ACTIVE'>('OFF');
  const liveSessionRef = useRef<LiveSession | null>(null);

  // Initialize Dark Mode Class
  useEffect(() => {
      if (darkMode) {
          document.documentElement.classList.add('dark');
      } else {
          document.documentElement.classList.remove('dark');
      }
  }, [darkMode]);

  // Simulate Initial Loading (Skeleton Demo)
  useEffect(() => {
      if(isAuthenticated) {
          setIsLoadingMissions(true);
          setTimeout(() => setIsLoadingMissions(false), 2000);
      }
  }, [isAuthenticated]);

  // Simulate Real-Time Mission Updates (Live Dashboard)
  useEffect(() => {
      if (!isAuthenticated) return;

      const timer = setTimeout(() => {
          const newMission: Mission = {
              id: `rt-${Date.now()}`,
              type: MissionType.MEDICAL_NEED,
              title: 'Urgent: Insulin Pickup',
              description: 'Elderly resident needs prescription pickup from CVS. Cannot drive due to vision.',
              location: 'Sunset Blvd',
              distance: '0.5 mi',
              reward: 200,
              status: MissionStatus.OPEN,
              urgency: 'HIGH',
              timeEstimate: '20 min',
              medicalData: {
                  medication: 'Insulin (Refrigerated)',
                  isUrgentTransport: true
              }
          };
          setMissions(prev => [newMission, ...prev]);
          addToast('success', 'New Alert', 'Urgent Medical Mission added nearby!');
      }, 10000); // Trigger after 10s

      return () => clearTimeout(timer);
  }, [isAuthenticated]);

  // Toast Helper
  const addToast = (type: 'success' | 'error', title: string, message: string) => {
      const id = Date.now().toString();
      setToasts(prev => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
      setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleLogin = (provider?: string) => {
      setIsAuthenticated(true);
      addToast('success', 'Welcome back!', provider ? `Successfully logged in with ${provider}.` : 'You are logged in.');
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      setActiveTab('HOME'); // Reset tab
      addToast('success', 'Logged Out', 'See you next time!');
      toggleVoiceMode(true); // Force off
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
          if(!forceOff) addToast('success', 'Voice Mode Off', 'Standard interface active.');
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
          
          setMissions(prev => [...newMissions, ...prev]);
          addToast('success', 'Project Decomposed', `Created ${newMissions.length} micro-missions from your goal.`);
      } else {
          addToast('error', 'Planning Failed', 'Could not break down the project. Try again.');
      }
      setIsPlanning(false);
      setIsCreatingReport(false); // Close modal if open
  };

  const handleMissionComplete = async (completedMission: Mission) => {
      setMissions(prev => prev.map(m => 
        m.id === completedMission.id ? { ...m, status: MissionStatus.VERIFIED } : m
      ));
      
      const xpGained = completedMission.reward;
      setUser(prev => ({
          ...prev,
          trustScore: Math.min(100, prev.trustScore + 5),
          impactCredits: prev.impactCredits + xpGained
      }));

      setSelectedMission(null);
      addToast('success', 'Mission Verified!', `You earned ${xpGained} Impact Credits & 5 Trust Points.`);
  };

  const handleReportSubmit = (newMission: Mission) => {
      setMissions([newMission, ...missions]);
      setIsCreatingReport(false);
      addToast('success', 'Report Submitted', 'Your bounty has been posted to the community map.');
  };

  const filteredMissions = missions.filter(m => filter === 'ALL' || m.type === filter);

  if (!isAuthenticated) {
      return <LoginScreen onLogin={handleLogin} onDemoTour={handleDemoTour} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row md:max-w-4xl md:mx-auto md:shadow-2xl md:min-h-0 md:h-[90vh] md:mt-[5vh] md:rounded-3xl overflow-hidden font-sans relative transition-colors duration-200">
      
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
             {voiceMode === 'ACTIVE' ? <><Mic className="w-4 h-4"/> Live: On</> : <><MicOff className="w-4 h-4"/> Voice</>}
         </button>
      </div>

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-64 bg-slate-900 dark:bg-slate-950 text-white p-6 shrink-0 transition-colors">
        <h1 className="text-2xl font-bold tracking-tight mb-8">Community Hero</h1>
        <div className="space-y-4">
            <button onClick={() => setActiveTab('HOME')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors ${activeTab === 'HOME' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800'}`}>
                <Home className="w-5 h-5"/> Missions
            </button>
            <button onClick={() => setActiveTab('LEADERBOARD')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors ${activeTab === 'LEADERBOARD' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800'}`}>
                <Trophy className="w-5 h-5"/> Impact Hub
            </button>
            <button onClick={() => setActiveTab('CREATIVE')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors ${activeTab === 'CREATIVE' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800'}`}>
                <Paintbrush className="w-5 h-5"/> Creative Studio
            </button>
            <button onClick={() => setActiveTab('PROFILE')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors ${activeTab === 'PROFILE' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800'}`}>
                <User className="w-5 h-5"/> Profile
            </button>
        </div>
        
        {/* Mesh Mode & Voice Toggle */}
        <div className="mt-8 space-y-3">
             <button 
                onClick={() => setIsMeshMode(!isMeshMode)}
                className={`w-full text-xs font-bold py-2 rounded-lg transition-colors border ${isMeshMode ? 'bg-orange-900 text-orange-200 border-orange-800' : 'bg-slate-800 text-slate-300 border-slate-700'}`}
             >
                 {isMeshMode ? 'Mesh Mode: Active' : 'Switch to Mesh Mode'}
             </button>
             <button 
                onClick={() => toggleVoiceMode()}
                className={`w-full text-xs font-bold py-2 rounded-lg transition-colors border flex items-center justify-center gap-2 ${voiceMode === 'ACTIVE' ? 'bg-red-900 text-red-100 border-red-800 animate-pulse' : 'bg-slate-800 text-slate-300 border-slate-700'}`}
             >
                 {voiceMode === 'ACTIVE' ? <><Mic className="w-3 h-3"/> VoiceNav Active</> : <><MicOff className="w-3 h-3"/> Enable VoiceNav</>}
             </button>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-800">
             <div className="mb-4 space-y-2">
                 <button onClick={() => setDarkMode(!darkMode)} className="flex items-center gap-3 w-full p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium">
                     {darkMode ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>} {darkMode ? 'Light Mode' : 'Dark Mode'}
                 </button>
                 <button 
                    onClick={() => setShowHelp(true)}
                    className="flex items-center gap-3 w-full p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium"
                 >
                    <HelpCircle className="w-5 h-5" /> Help & Support
                 </button>
                 <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors text-sm font-medium"
                 >
                    <LogOut className="w-5 h-5" /> Log Out
                 </button>
             </div>
             <div className="flex items-center gap-3 pt-2">
                 <img src={user.avatarUrl} className="w-10 h-10 rounded-full border-2 border-green-500" />
                 <div>
                     <p className="font-bold text-sm">{user.name}</p>
                     <p className="text-xs text-slate-400">Trust Score: {user.trustScore}</p>
                 </div>
             </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen md:h-full relative overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors">
        
        {/* Mobile Header */}
        <header className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center sticky top-0 z-10 shrink-0">
             <h1 className="text-xl font-bold text-slate-900 dark:text-white">Community Hero</h1>
             <div className="flex items-center gap-2">
                 <div className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                     <ShieldCheck className="w-3 h-3 text-green-600"/> <span className="dark:text-white">{user.trustScore}</span>
                 </div>
                 <button onClick={() => setActiveTab('PROFILE')}>
                     <img src={user.avatarUrl} className="w-8 h-8 rounded-full" />
                 </button>
             </div>
        </header>

        {isMeshMode && (
            <div className="bg-orange-500 text-white text-xs font-bold text-center py-1 flex justify-center items-center gap-2 animate-pulse shrink-0">
                <WifiOff className="w-3 h-3"/> MESH MODE ACTIVE: DISASTER RECOVERY PROTOCOL
            </div>
        )}

        {/* Content Switcher */}
        {activeTab === 'HOME' && (
             <div className="flex-1 flex flex-col relative overflow-hidden">
                 
                 {/* Filters & View Toggle */}
                 <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm shrink-0 z-10 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
                            <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === 'ALL' ? 'bg-slate-900 text-white dark:bg-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>All</button>
                            {/* Concept 2: Medimate */}
                            <button onClick={() => setFilter(MissionType.MEDICAL_NEED)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === MissionType.MEDICAL_NEED ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>Medimate</button>
                            <button onClick={() => setFilter(MissionType.FIX_BOUNTY)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === MissionType.FIX_BOUNTY ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>Fixes</button>
                            <button onClick={() => setFilter(MissionType.FOOD_FIT)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === MissionType.FOOD_FIT ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>Food</button>
                        </div>
                        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 shrink-0">
                            <button onClick={() => setViewMode('LIST')} className={`p-2 rounded-md transition-all ${viewMode === 'LIST' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                <List className="w-4 h-4"/>
                            </button>
                            <button onClick={() => setViewMode('MAP')} className={`p-2 rounded-md transition-all ${viewMode === 'MAP' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                <MapIcon className="w-4 h-4"/>
                            </button>
                        </div>
                    </div>
                 </div>

                 <div className="flex-1 overflow-y-auto relative">
                     {viewMode === 'LIST' ? (
                        <div className="p-4 space-y-2 pb-24 md:pb-6">
                            {/* Marathon Agent Call to Action */}
                            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 rounded-xl text-white mb-4 shadow-lg cursor-pointer" onClick={() => setIsCreatingReport(true)}>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-bold flex items-center gap-2"><BrainCircuit className="w-4 h-4"/> Marathon Agent</h3>
                                        <p className="text-xs text-indigo-100 mt-1 max-w-[200px]">Have a complex goal? (e.g., "Clean up the river"). Gemini will plan it for you.</p>
                                    </div>
                                    <div className="bg-white/20 p-2 rounded-lg">
                                        <Plus className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Nearby Missions</h2>
                                <span className="text-xs text-slate-400">{filteredMissions.length} active</span>
                            </div>

                            {isLoadingMissions ? (
                                <>
                                    <MissionCardSkeleton />
                                    <MissionCardSkeleton />
                                    <MissionCardSkeleton />
                                </>
                            ) : (
                                <>
                                    {filteredMissions.map(m => (
                                        <MissionCard key={m.id} mission={m} onClick={setSelectedMission} />
                                    ))}
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
                                <MapIcon className="w-3 h-3 text-blue-500"/> Live Community Map
                            </div>
                             <MapView missions={filteredMissions} resources={INITIAL_RESOURCES} onMissionClick={setSelectedMission} />
                         </div>
                     )}
                 </div>
             </div>
        )}

        {activeTab === 'LEADERBOARD' && <Leaderboard />}
        
        {/* New Creative Studio Tab */}
        {activeTab === 'CREATIVE' && <CreativeStudio onClose={() => setActiveTab('HOME')} />}

        {activeTab === 'PROFILE' && (
            <div className="p-6 overflow-y-auto pb-24 h-full relative">
                {/* Mobile Logout Button at Top Right of Profile */}
                <div className="md:hidden absolute top-6 right-6">
                     <button onClick={handleLogout} className="p-2 bg-red-50 text-red-500 rounded-full">
                         <LogOut className="w-5 h-5" />
                     </button>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold dark:text-white">Profile</h2>
                    <button onClick={() => setDarkMode(!darkMode)} className="md:hidden p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {darkMode ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
                    </button>
                </div>

                {/* Enhanced Gamification Profile */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center mb-6 transition-colors">
                    <img src={user.avatarUrl} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-slate-50 dark:border-slate-700" />
                    <h3 className="text-xl font-bold dark:text-white">{user.name}</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">{user.role.replace('_', ' ')}</p>
                    
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 mb-2 overflow-hidden">
                         <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                    <p className="text-xs text-slate-400 mb-6 flex justify-between">
                        <span>Level 5</span>
                        <span>700 / 1000 XP to Level 6</span>
                    </p>

                    <div className="flex justify-center gap-8 border-t border-slate-100 dark:border-slate-700 pt-4">
                        <div>
                            <p className="text-3xl font-black text-slate-900 dark:text-white">{user.trustScore}</p>
                            <p className="text-xs text-slate-400 uppercase tracking-widest">Trust Score</p>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-slate-900 dark:text-white">{missions.filter(m => m.status === MissionStatus.VERIFIED).length + 12}</p>
                            <p className="text-xs text-slate-400 uppercase tracking-widest">Missions</p>
                        </div>
                    </div>
                </div>

                <h3 className="font-bold mb-3 flex items-center gap-2 dark:text-white"><Wallet className="w-5 h-5 text-indigo-600"/> Impact Wallet</h3>
                <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-lg mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                        <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Total Impact Credits</p>
                        <h2 className="text-4xl font-bold mb-4">{user.impactCredits.toLocaleString()} <span className="text-lg font-normal text-indigo-300">IC</span></h2>
                        
                        <div className="flex gap-2">
                             <button className="flex-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2 rounded-lg">Redeem</button>
                             <button className="flex-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2 rounded-lg">History</button>
                        </div>
                    </div>
                </div>
                
                <h3 className="font-bold mb-3 dark:text-white">Badges</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                    {user.badges.map(b => (
                        <span key={b} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
                             <Award className="w-3 h-3 text-yellow-500"/> {b}
                        </span>
                    ))}
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-3 py-1 rounded-lg text-sm font-medium border border-dashed border-slate-300 dark:border-slate-600 opacity-70">
                        Pothole Patroller (Locked)
                    </span>
                    <button className="bg-violet-50 text-violet-600 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 border border-violet-100 border-dashed">
                        <Plus className="w-3 h-3"/> Earn More
                    </button>
                </div>
                
                <div className="md:hidden mt-8">
                     <button onClick={() => setShowHelp(true)} className="w-full flex items-center justify-center gap-2 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-300 transition-colors">
                         <HelpCircle className="w-5 h-5" /> Help & Support
                     </button>
                </div>
            </div>
        )}

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
             <button onClick={() => setActiveTab('HOME')} className={`flex flex-col items-center gap-1 ${activeTab === 'HOME' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                 <Home className="w-6 h-6" />
                 <span className="text-[10px] font-bold">Missions</span>
             </button>
             <button onClick={() => setActiveTab('LEADERBOARD')} className={`flex flex-col items-center gap-1 ${activeTab === 'LEADERBOARD' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                 <Trophy className="w-6 h-6" />
                 <span className="text-[10px] font-bold">Impact</span>
             </button>
             <button onClick={() => setActiveTab('PROFILE')} className={`flex flex-col items-center gap-1 ${activeTab === 'PROFILE' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                 <User className="w-6 h-6" />
                 <span className="text-[10px] font-bold">Profile</span>
             </button>
        </div>

      </main>

      {/* Modals/Overlays */}
      {selectedMission && (
          <MissionDetail 
            mission={selectedMission} 
            onBack={() => setSelectedMission(null)} 
            onComplete={handleMissionComplete}
            addToast={addToast}
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

    </div>
  );
};

export default App;