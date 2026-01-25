import React from 'react';
import { Mission, MissionType } from '../types';
import { MapPin, Clock, Zap, Heart, Wrench, Utensils, BookOpen, AlertCircle } from 'lucide-react';

interface MissionCardProps {
  mission: Mission;
  onClick: (mission: Mission) => void;
}

const MissionCard: React.FC<MissionCardProps> = ({ mission, onClick }) => {
  
  const getTheme = (type: MissionType) => {
    switch (type) {
      case MissionType.FOOD_FIT:
        return { 
          bg: 'bg-orange-50', 
          border: 'border-orange-200', 
          icon: <Utensils className="w-5 h-5 text-orange-600" />,
          text: 'text-orange-700'
        };
      case MissionType.LONELY_MINUTES:
        return { 
          bg: 'bg-blue-50', 
          border: 'border-blue-200', 
          icon: <Heart className="w-5 h-5 text-blue-600" />,
          text: 'text-blue-700'
        };
      case MissionType.FIX_BOUNTY:
        return { 
          bg: 'bg-yellow-50', 
          border: 'border-yellow-200', 
          icon: <Wrench className="w-5 h-5 text-yellow-600" />,
          text: 'text-yellow-700'
        };
      case MissionType.LIFE_SKILL:
        return { 
          bg: 'bg-emerald-50', 
          border: 'border-emerald-200', 
          icon: <BookOpen className="w-5 h-5 text-emerald-600" />,
          text: 'text-emerald-700'
        };
    }
  };

  const theme = getTheme(mission.type);

  return (
    <div 
      onClick={() => onClick(mission)}
      className={`w-full p-4 mb-3 rounded-xl border ${theme.border} ${theme.bg} shadow-sm active:scale-[0.98] transition-transform cursor-pointer relative overflow-hidden`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-full bg-white bg-opacity-60`}>
            {theme.icon}
          </div>
          <span className={`text-xs font-bold uppercase tracking-wider ${theme.text}`}>
            {mission.type.replace('_', ' ')}
          </span>
        </div>
        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow-sm border border-slate-100">
          <Zap className="w-3 h-3 text-amber-500 fill-current" />
          <span className="text-xs font-bold text-slate-700">{mission.reward}</span>
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-800 mb-1 leading-tight">{mission.title}</h3>
      <p className="text-sm text-slate-600 mb-4 line-clamp-2">{mission.description}</p>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
            {mission.distance !== 'N/A' && (
                <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {mission.distance}
                </span>
            )}
            <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {mission.timeEstimate}
            </span>
        </div>
        {mission.urgency === 'HIGH' && (
            <span className="flex items-center gap-1 text-red-600 font-medium animate-pulse">
                <AlertCircle className="w-3 h-3" />
                Urgent
            </span>
        )}
      </div>
    </div>
  );
};

export default MissionCard;