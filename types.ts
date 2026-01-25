export enum MissionType {
  FOOD_FIT = 'FOOD_FIT',
  LONELY_MINUTES = 'LONELY_MINUTES',
  FIX_BOUNTY = 'FIX_BOUNTY',
  LIFE_SKILL = 'LIFE_SKILL',
  MEDICAL_NEED = 'MEDICAL_NEED', // Concept 2: Medimate
  PROJECT_MARATHON = 'PROJECT_MARATHON' // Strategic Track: Marathon Agent
}

export enum MissionStatus {
  OPEN = 'OPEN',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  VERIFYING = 'VERIFYING',
  VERIFIED = 'VERIFIED',
  CLOSED = 'CLOSED',
}

export enum UserRole {
  NEIGHBOR = 'NEIGHBOR',
  VERIFIED_VOLUNTEER = 'VERIFIED_VOLUNTEER',
  CITY_ADMIN = 'CITY_ADMIN',
}

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  trustScore: number; // 0 - 100
  impactCredits: number; // Impact Wallet
  role: UserRole;
  badges: string[];
}

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  distance: string;
  reward: number;
  status: MissionStatus;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  timeEstimate: string;
  
  verifiedSource?: string;

  // Squad Mode (Concept 9)
  squadSize?: number;
  currentSquad?: number;

  proof?: {
    imageUrl?: string;
    verifiedAt?: string;
    checklistCompleted?: boolean;
    aiVerificationNote?: string;
  };

  // Lane specific optional data
  foodData?: {
    allergens: string[];
    expiry: string;
  };
  fixData?: {
    severity: string;
    imageUrl?: string;
  };
  lonelyData?: {
    topic: string;
    mode: 'CALL' | 'WALK' | 'CHAT';
  };
  skillData?: {
    moduleName: string;
    contextTrigger?: string;
    arOverlay?: boolean;
  };
  // Concept 2: Medimate
  medicalData?: {
    bloodType?: string;
    medication?: string;
    isUrgentTransport?: boolean;
  };
  // Strategic Track: Marathon Agent
  projectData?: {
    subMissions: string[]; // IDs of child missions
    progress: number;
  };
  // Strategic Track: Creative Autopilot
  campaignData?: {
    posterUrl?: string;
  };
}

export interface IncidentReport {
  category: string;
  severity: string;
  description: string;
}

export interface SkillLesson {
  title: string;
  steps: string[];
  checklist: string[];
}

// Strategic Track: Creative Autopilot
export interface CreativeAsset {
    id: string;
    type: 'POSTER' | 'FLYER';
    prompt: string;
    imageUrl: string;
}

// Concept 1, 6, 10: Community Resources
export enum ResourceType {
  HOSPITAL = 'HOSPITAL',
  SHELTER = 'SHELTER',
  FOOD_BANK = 'FOOD_BANK'
}

export interface CommunityResource {
  id: string;
  type: ResourceType;
  name: string;
  description: string;
  coordinates: { lat: number; lng: number };
  contact: string;
}

// Concept 12: Social Impact Startups
export interface ImpactStartup {
  id: string;
  name: string;
  description: string;
  category: string;
  fundingStatus: 'Seed' | 'Series A' | 'Grant Needed';
  website: string;
}