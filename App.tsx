import React, { useState } from 'react';
import { Mission, MissionType, MissionStatus } from './types';
import { INITIAL_MISSIONS, CURRENT_USER } from './constants';
import MissionCard from './components/MissionCard';
import MissionDetail from './components/MissionDetail';
import CreateFixReport from './components/CreateFixReport';
import { generateLifeSkillLesson } from './services/geminiService';
import { Map, User, Plus, Home, ShieldCheck, Wifi, WifiOff, Wallet, TrendingUp, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [activeTab, setActiveTab] = useState<'HOME' | 'PROFILE'>('HOME');
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [filter, setFilter] = useState<MissionType | 'ALL'>('ALL');
  const [isMeshMode, setIsMeshMode] = useState(false);
  const [user, setUser] = useState(CURRENT_USER);

  // THE GROWTH LOOP: Completing a mission triggers a relevant Life Skill
  const handleMissionComplete = async (completedMission: Mission) => {
      // 1. Update the mission status
      setMissions(prev => prev.map(m => 
        m.id === completedMission.id ? { ...m, status: MissionStatus.VERIFIED } : m
      ));
      
      // 2. Reward the user (Impact Wallet)
      setUser(prev => ({
          ...prev,
          trustScore: Math.min(100, prev.trustScore + 5),
          impactCredits: prev.impactCredits + completedMission.reward
      }));

      setSelectedMission(null);

      // 3. Trigger Life Skill GPS Logic
      // If they just fixed something, teach them about it.
      if (completedMission.type === MissionType.FIX_BOUNTY) {
          const newSkillId = `skill-${Date.now()}`;
          const triggerContext = completedMission.title;
          
          // Optimistic UI update - Add the mission immediately
          const newSkillMission: Mission = {
              id: newSkillId,
              type: MissionType.LIFE_SKILL,
              title: `Unlock: Master ${triggerContext}`,
              description: `You just fixed a ${triggerContext}. Learn the pro skills behind it to earn extra trust.`,
              location: 'Digital',
              distance: 'N/A',
              reward: 50,
              status: MissionStatus.OPEN,
              urgency: 'LOW',
              timeEstimate: '3 min',
              skillData: {
                  moduleName: triggerContext, // Pass the context to Gemini
                  contextTrigger: `Fixing ${triggerContext}`
              }
          };

          // Add to top of feed with animation delay
          setTimeout(() => {
              setMissions(prev => [newSkillMission, ...prev]);
              // Optional: Auto-select or notify
              alert(`🎓 New Life Skill Unlocked: Master ${triggerContext}`);
          }, 1500);
      }
  };

  const handleReportSubmit = (newMission: Mission) => {
      setMissions([newMission, ...missions]);
      setIsCreatingReport(false);
  };

  const filteredMissions = missions.filter(m => filter === 'ALL' || m.type === filter);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row md:max-w-4xl md:mx-auto md:shadow-2xl md:min-h-0 md:h-[90vh] md:mt-[5vh] md:rounded-3xl overflow-hidden font-sans">
      
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-64 bg-slate-900 text-white p-6">
        <h1 className="text-2xl font-bold tracking-tight mb-8">CommunityOS</h1>
        <div className="space-y-4">
            <button onClick={() => setActiveTab('HOME')} className={`flex items-center gap-3 w-full p-3 rounded-xl ${activeTab === 'HOME' ? 'bg-slate-800' : 'hover:bg-slate-800'}`}>
                <Home className="w-5 h-5"/> Home
            </button>
            <button onClick={() => setActiveTab('PROFILE')} className={`flex items-center gap-3 w-full p-3 rounded-xl ${activeTab === 'PROFILE' ? 'bg-slate-800' : 'hover:bg-slate-800'}`}>
                <User className="w-5 h-5"/> Profile
            </button>
        </div>
        
        {/* Mesh Mode Toggle */}
        <div className="mt-8 bg-slate-800 p-4 rounded-xl border border-slate-700">
             <div className="flex justify-between items-center mb-2">
                 <span className="text-xs font-bold text-slate-400">CONNECTIVITY</span>
                 {isMeshMode ? <WifiOff className="w-4 h-4 text-orange-400"/> : <Wifi className="w-4 h-4 text-green-400"/>}
             </div>
             <button 
                onClick={() => setIsMeshMode(!isMeshMode)}
                className={`w-full text-xs font-bold py-2 rounded-lg transition-colors ${isMeshMode ? 'bg-orange-900 text-orange-200' : 'bg-slate-700 text-slate-300'}`}
             >
                 {isMeshMode ? 'Mesh Mode: Active' : 'Switch to Mesh Mode'}
             </button>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-800">
             <div className="flex items-center gap-3">
                 <img src={user.avatarUrl} className="w-10 h-10 rounded-full border-2 border-green-500" />
                 <div>
                     <p className="font-bold text-sm">{user.name}</p>
                     <p className="text-xs text-slate-400">Trust Score: {user.trustScore}</p>
                 </div>
             </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen md:h-full relative overflow-hidden">
        
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-10">
             <h1 className="text-xl font-bold text-slate-900">CommunityOS</h1>
             <div className="flex items-center gap-2">
                 <div className="bg-slate-100 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                     <ShieldCheck className="w-3 h-3 text-green-600"/> {user.trustScore}
                 </div>
                 <img src={user.avatarUrl} className="w-8 h-8 rounded-full" />
             </div>
        </header>

        {isMeshMode && (
            <div className="bg-orange-500 text-white text-xs font-bold text-center py-1 flex justify-center items-center gap-2 animate-pulse">
                <WifiOff className="w-3 h-3"/> MESH MODE ACTIVE: DISASTER RECOVERY PROTOCOL
            </div>
        )}

        {activeTab === 'HOME' ? (
             <div className="flex-1 overflow-y-auto pb-24 md:pb-6 relative">
                 {/* Map Placeholder */}
                 <div className="h-48 bg-slate-200 relative w-full group">
                     <img 
                        src="https://picsum.photos/id/10/800/300" 
                        className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 transition-all duration-500"
                        alt="Map View" 
                     />
                     <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-2">
                         <Map className="w-3 h-3 text-blue-500"/> Radius: 1.0 mi
                     </div>
                 </div>

                 {/* Filters */}
                 <div className="px-4 py-4 flex gap-2 overflow-x-auto no-scrollbar">
                     <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>All Lanes</button>
                     <button onClick={() => setFilter(MissionType.FIX_BOUNTY)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === MissionType.FIX_BOUNTY ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-white border border-slate-200 text-slate-600'}`}>Fix Bounty</button>
                     <button onClick={() => setFilter(MissionType.FOOD_FIT)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === MissionType.FOOD_FIT ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-white border border-slate-200 text-slate-600'}`}>Food Fit</button>
                     <button onClick={() => setFilter(MissionType.LIFE_SKILL)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === MissionType.LIFE_SKILL ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-white border border-slate-200 text-slate-600'}`}>Life Skills</button>
                 </div>

                 {/* Mission List */}
                 <div className="px-4 space-y-2">
                     <div className="flex justify-between items-center mb-2">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Nearby Missions</h2>
                        <span className="text-xs text-slate-400">{filteredMissions.length} active</span>
                     </div>
                     {filteredMissions.map(m => (
                         <MissionCard key={m.id} mission={m} onClick={setSelectedMission} />
                     ))}
                     {filteredMissions.length === 0 && (
                         <div className="text-center py-12 text-slate-400">
                             <p>No missions found in this lane.</p>
                         </div>
                     )}
                 </div>
             </div>
        ) : (
            <div className="p-6 overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6">Profile</h2>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center mb-6">
                    <img src={user.avatarUrl} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-slate-50" />
                    <h3 className="text-xl font-bold">{user.name}</h3>
                    <p className="text-slate-500 mb-4">{user.role.replace('_', ' ')}</p>
                    
                    <div className="flex justify-center gap-8 border-t border-slate-100 pt-4">
                        <div>
                            <p className="text-3xl font-black text-slate-900">{user.trustScore}</p>
                            <p className="text-xs text-slate-400 uppercase tracking-widest">Trust Score</p>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-slate-900">12</p>
                            <p className="text-xs text-slate-400 uppercase tracking-widest">Missions</p>
                        </div>
                    </div>
                </div>

                {/* Impact Wallet Section */}
                <h3 className="font-bold mb-3 flex items-center gap-2"><Wallet className="w-5 h-5 text-indigo-600"/> Impact Wallet</h3>
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
                
                <h3 className="font-bold mb-3">Badges</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                    {user.badges.map(b => (
                        <span key={b} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-sm font-medium">{b}</span>
                    ))}
                    <button className="bg-violet-50 text-violet-600 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 border border-violet-100 border-dashed">
                        <Plus className="w-3 h-3"/> Earn More
                    </button>
                </div>
            </div>
        )}

        {/* Floating Action Button (Mobile) */}
        <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8">
            <button 
                onClick={() => setIsCreatingReport(true)}
                className="bg-black text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-transform active:scale-95"
            >
                <Plus className="w-6 h-6" />
            </button>
        </div>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden border-t border-slate-200 bg-white flex justify-around p-3 pb-6">
             <button onClick={() => setActiveTab('HOME')} className={`flex flex-col items-center gap-1 ${activeTab === 'HOME' ? 'text-slate-900' : 'text-slate-400'}`}>
                 <Home className="w-6 h-6" />
                 <span className="text-[10px] font-bold">Missions</span>
             </button>
             <button onClick={() => setActiveTab('PROFILE')} className={`flex flex-col items-center gap-1 ${activeTab === 'PROFILE' ? 'text-slate-900' : 'text-slate-400'}`}>
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
          />
      )}

      {isCreatingReport && (
          <CreateFixReport 
            onClose={() => setIsCreatingReport(false)}
            onSubmit={handleReportSubmit}
          />
      )}

    </div>
  );
};

export default App;