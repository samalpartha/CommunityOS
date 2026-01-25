import React, { useState } from 'react';
import { User, ShieldCheck, Trophy, Medal, Star, Rocket, ExternalLink, Handshake } from 'lucide-react';
import { IMPACT_STARTUPS } from '../constants';

const MOCK_LEADERS = [
    { id: 'u1', name: 'Alex Rivera', score: 1250, role: 'Verified Volunteer', avatar: 'https://picsum.photos/id/64/100/100' },
    { id: 'u2', name: 'Sarah Chen', score: 1100, role: 'Neighbor', avatar: 'https://picsum.photos/id/65/100/100' },
    { id: 'u3', name: 'Mike Johnson', score: 950, role: 'City Admin', avatar: 'https://picsum.photos/id/66/100/100' },
    { id: 'u4', name: 'Emily Davis', score: 820, role: 'Neighbor', avatar: 'https://picsum.photos/id/67/100/100' },
    { id: 'u5', name: 'James Wilson', score: 780, role: 'Volunteer', avatar: 'https://picsum.photos/id/68/100/100' },
];

const Leaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'LEADERS' | 'STARTUPS'>('LEADERS');

  return (
    <div className="p-4 md:p-6 pb-24 overflow-y-auto h-full flex flex-col">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white mb-6 shadow-lg shrink-0">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2"><Trophy className="w-6 h-6 text-yellow-300"/> Impact Hub</h2>
                <div className="bg-white/20 p-1 rounded-lg flex gap-1">
                     <button 
                        onClick={() => setActiveTab('LEADERS')}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${activeTab === 'LEADERS' ? 'bg-white text-indigo-900' : 'text-indigo-100 hover:bg-white/10'}`}
                     >
                         Heroes
                     </button>
                     <button 
                        onClick={() => setActiveTab('STARTUPS')}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${activeTab === 'STARTUPS' ? 'bg-white text-indigo-900' : 'text-indigo-100 hover:bg-white/10'}`}
                     >
                         Ecosystem
                     </button>
                </div>
            </div>
            <p className="text-indigo-100 text-sm">
                {activeTab === 'LEADERS' ? 'Top contributors making the neighborhood safer.' : 'Discover social impact startups and funding.'}
            </p>
        </div>

        <div className="space-y-3 flex-1 overflow-y-auto">
            {activeTab === 'LEADERS' ? (
                MOCK_LEADERS.map((user, index) => (
                    <div key={user.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.01] ${index === 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <div className="font-black text-slate-300 w-6 text-center text-lg">
                            {index === 0 ? <Medal className="w-6 h-6 text-yellow-500 mx-auto"/> : 
                            index === 1 ? <Medal className="w-6 h-6 text-slate-400 mx-auto"/> :
                            index === 2 ? <Medal className="w-6 h-6 text-orange-400 mx-auto"/> : 
                            index + 1}
                        </div>
                        
                        <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                        
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-800">{user.name}</h3>
                            <p className="text-xs text-slate-500">{user.role}</p>
                        </div>

                        <div className="text-right">
                            <p className="font-bold text-indigo-600 flex items-center justify-end gap-1">
                                {user.score} <span className="text-[10px] text-indigo-400 uppercase">XP</span>
                            </p>
                        </div>
                    </div>
                ))
            ) : (
                <div className="space-y-4">
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                        <p className="text-sm text-slate-500 font-medium">Concept 12: Startup Discovery</p>
                    </div>
                    {IMPACT_STARTUPS.map(startup => (
                        <div key={startup.id} className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                             <div className="flex justify-between items-start mb-2">
                                 <div>
                                     <h3 className="font-bold text-lg text-slate-900">{startup.name}</h3>
                                     <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md mt-1 inline-block">{startup.category}</span>
                                 </div>
                                 <div className={`text-[10px] font-bold px-2 py-1 rounded-full border ${startup.fundingStatus === 'Grant Needed' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                                     {startup.fundingStatus}
                                 </div>
                             </div>
                             <p className="text-sm text-slate-600 mb-4">{startup.description}</p>
                             <div className="flex gap-2">
                                 <button className="flex-1 bg-slate-900 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2">
                                     <Handshake className="w-3 h-3"/> Connect
                                 </button>
                                 <button className="flex-1 bg-slate-100 text-slate-600 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2">
                                     <Rocket className="w-3 h-3"/> Fund
                                 </button>
                             </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default Leaderboard;