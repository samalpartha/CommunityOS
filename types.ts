export enum BloodType {
  A_POS = 'A+',
  A_NEG = 'A-',
  B_POS = 'B+',
  B_NEG = 'B-',
  AB_POS = 'AB+',
  AB_NEG = 'AB-',
  O_POS = 'O+',
  O_NEG = 'O-',
}

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
  STUDENT = 'STUDENT',
  COUNSELOR = 'COUNSELOR', // New Role
  CITY_ADMIN = 'CITY_ADMIN',
}

export interface Certificate {
  id: string;
  type: 'BRONZE' | 'SILVER' | 'GOLD' | 'CUSTOM';
  hoursCompleted: number;
  issuedDate: string;
  downloadUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email?: string; // Added for Counselor Dashboard
  avatarUrl: string;
  trustScore: number; // 0 - 100
  impactCredits: number; // Impact Wallet
  role: UserRole;
  badges: string[];

  // Student-specific fields
  studentData?: {
    schoolId: string;
    schoolName: string;
    graduationYear: number;
    counselorEmail: string;
    verifiedHours: number;
    pendingHours: number;
    certificates: Certificate[];
  };

  // Gamification (Concept 13)
  streak: number;
  lastLoginDate: string; // ISO Date
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
    bloodType?: BloodType;
    medication?: string;
    isUrgentTransport?: boolean;
    condition?: string;
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

  // 311 API Integration
  autoImported?: boolean;
  cityReportsId?: string; // Original ID from 311 system
  citySource?: 'NYC' | 'SF' | 'CHI';

  // Trust & Safety
  rating?: Rating;
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
  FOOD_BANK = 'FOOD_BANK',
  PHARMACY = 'PHARMACY',
  COMMUNITY_CENTER = 'COMMUNITY_CENTER'
}

export interface CommunityResource {
  id: string;
  type: ResourceType;
  name: string;
  description: string;
  coordinates?: { lat: number; lng: number }; // Deprecated, use location
  location: { lat: number; lng: number; address: string };
  contact: {
    phone: string;
    hours: string;
  };
  services: string[];
  verified: boolean;
  lastUpdated: Date;
  cityId?: string;
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

export interface Rating {
  score: number;
  tags: string[];
  comments: string;
  ratedBy: string; // User ID
  ratedAt: string;
}