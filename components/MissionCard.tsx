import React from 'react';
import { Mission, MissionType } from '../types';
import { MapPin, Clock, Zap, Heart, Wrench, Utensils, BookOpen, AlertCircle, Users, Activity, BrainCircuit, Leaf, Shield } from 'lucide-react';
import { Card, Badge, Button } from './index';

interface MissionCardProps {
  mission: Mission;
  onClick: (mission: Mission) => void;
}

const MissionCard: React.FC<MissionCardProps> = ({ mission, onClick }) => {

  const getTheme = (type: MissionType) => {
    switch (type) {
      case MissionType.SAFETY_PATROL:
        return {
          bg: 'bg-indigo-50',
          border: 'border-indigo-200',
          icon: <Shield className="w-5 h-5 text-indigo-600" />,
          text: 'text-indigo-700'
        };
      case MissionType.ENVIRONMENTAL:
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: <Leaf className="w-5 h-5 text-green-600" />,
          text: 'text-green-700'
        };
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
      case MissionType.MEDICAL_NEED: // Concept 2: Medimate
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: <Activity className="w-5 h-5 text-red-600" />,
          text: 'text-red-700'
        };
      default:
        return {
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          icon: <Zap className="w-5 h-5 text-slate-600" />,
          text: 'text-slate-700'
        };
    }
  };

  const theme = getTheme(mission.type);

  return (
    <Card
      variant="mission"
      hoverable={true}
      onClick={() => onClick(mission)}
      className="mb-3"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`p-2 rounded-full bg-white bg-opacity-60`}>
            {theme.icon}
          </div>
          <span className={`text-xs font-bold uppercase tracking-wider ${theme.text}`}>
            {mission.type.replace('_', ' ')}
          </span>
          {/* Squad Badge */}
          {mission.squadSize && mission.squadSize > 1 && (
            <Badge variant="active" className="text-[10px]">
              <Users className="w-3 h-3" /> SQUAD
            </Badge>
          )}
          {/* Marathon Agent Badge */}
          {mission.id.startsWith('marathon') && (
            <Badge variant="trustScore" className="text-[10px]">
              <BrainCircuit className="w-3 h-3" /> AGENT PLAN
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow-sm border border-slate-100 shrink-0">
          <Zap className="w-3 h-3 text-amber-500 fill-current" />
          <span className="text-xs font-bold text-slate-700">{mission.reward}</span>
        </div>
      </div>

      <h3 className="text-lg font-heading font-bold text-slate-800 mb-1 leading-tight">{mission.title}</h3>
      <p className="text-sm text-slate-600 mb-4 line-clamp-2">{mission.description}</p>

      <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
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

        <div className="flex items-center gap-2">
          {mission.urgency === 'HIGH' && (
            <Badge variant="urgent" className="mr-2">
              <AlertCircle className="w-3 h-3" /> Urgent
            </Badge>
          )}

          {/* Team Up Button */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              // Future: Trigger Squad Mode
            }}
            variant="secondary"
            size="sm"
            className="text-xs"
          >
            <Users className="w-3 h-3" /> Team Up
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MissionCard;