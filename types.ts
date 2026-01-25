export enum MissionType {
  FOOD_FIT = 'FOOD_FIT',
  LONELY_MINUTES = 'LONELY_MINUTES',
  FIX_BOUNTY = 'FIX_BOUNTY',
  LIFE_SKILL = 'LIFE_SKILL',
}

export enum MissionStatus {
  OPEN = 'OPEN',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  VERIFYING = 'VERIFYING', // New state for AI/Community verification
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
  distance: string; // e.g., "0.2 mi"
  reward: number; // Points or Bounty
  status: MissionStatus;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  timeEstimate: string; // e.g., "15 min"
  
  // Squad Mode
  squadSize?: number;
  currentSquad?: number;

  // Proof of Completion (The Core Differentiator)
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
    contextTrigger?: string; // What triggered this lesson?
    arOverlay?: boolean;
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