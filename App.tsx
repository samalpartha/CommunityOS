import React, { useState } from 'react';
import { Mission, UserRole, MissionType } from './types';
import { INITIAL_MISSIONS, CURRENT_USER } from './constants';
import MissionCard from './components/MissionCard';
import MissionDetail from './components/MissionDetail';
import CreateFixReport from './components/CreateFixReport';
import { Map, User, Plus, Home, Filter, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [activeTab, setActiveTab] = useState<'HOME' | 'PROFILE'>('HOME');
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [filter, setFilter] = useState<MissionType | 'ALL'>('ALL');

  const handleMissionComplete = (id: string) => {
      // In a real app, this would verify via backend
      // Here we assume verified immediately for demo flow
      setMissions(prev => prev.filter(m => m.id !== id));
      setSelectedMission(null);
      // Logic to trigger Life Skill mission could go here
      if (Math.random() > 0.5) {
        alert("🎉 You unlocked a new Life Skill mission based on your activity!");
      }
  };

  const handleReportSubmit = (newMission: Mission) => {
      setMissions([newMission, ...missions]);
      setIsCreatingReport(false);
  };

  const filteredMissions = missions.filter(m => filter === 'ALL' || m.type === filter);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row md:max-w-4xl md:mx-auto md:shadow-2xl md:min-h-0 md:h-[90vh] md:mt-[5vh] md:rounded-3xl overflow-hidden">
      
      {/* Mobile Sidebar/Nav for Desktop */}
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
        <div className="mt-auto pt-6 border-t border-slate-800">
             <div className="flex items-center gap-3">
                 <img src={CURRENT_USER.avatarUrl} className="w-10 h-10 rounded-full border-2 border-green-500" />
                 <div>
                     <p className="font-bold text-sm">{CURRENT_USER.name}</p>
                     <p className="text-xs text-slate-400">Trust Score: {CURRENT_USER.trustScore}</p>
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
                     <ShieldCheck className="w-3 h-3 text-green-600"/> {CURRENT_USER.trustScore}
                 </div>
                 <img src={CURRENT_USER.avatarUrl} className="w-8 h-8 rounded-full" />
             </div>
        </header>

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
                     <button onClick={() => setFilter(MissionType.LONELY_MINUTES)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === MissionType.LONELY_MINUTES ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-white border border-slate-200 text-slate-600'}`}>Lonely Mins</button>
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
                    <img src={CURRENT_USER.avatarUrl} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-slate-50" />
                    <h3 className="text-xl font-bold">{CURRENT_USER.name}</h3>
                    <p className="text-slate-500 mb-4">{CURRENT_USER.role.replace('_', ' ')}</p>
                    
                    <div className="flex justify-center gap-8 border-t border-slate-100 pt-4">
                        <div>
                            <p className="text-3xl font-black text-slate-900">{CURRENT_USER.trustScore}</p>
                            <p className="text-xs text-slate-400 uppercase tracking-widest">Trust Score</p>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-slate-900">12</p>
                            <p className="text-xs text-slate-400 uppercase tracking-widest">Missions</p>
                        </div>
                    </div>
                </div>
                
                <h3 className="font-bold mb-3">Badges</h3>
                <div className="flex flex-wrap gap-2">
                    {CURRENT_USER.badges.map(b => (
                        <span key={b} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-sm font-medium">{b}</span>
                    ))}
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