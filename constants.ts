import { Mission, MissionStatus, MissionType, User, UserRole, CommunityResource, ResourceType, ImpactStartup } from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Alex Rivera',
  avatarUrl: 'https://picsum.photos/id/64/200/200',
  trustScore: 85,
  impactCredits: 1250,
  role: UserRole.STUDENT,
  badges: ['Early Adopter', 'Fixer', 'Good Listener'],
  studentData: {
    schoolId: 'lincoln-high-2026',
    schoolName: 'Lincoln High School',
    graduationYear: 2026,
    counselorEmail: 'counselor@lincolnhs.edu',
    verifiedHours: 32,
    pendingHours: 8,
    certificates: [
      {
        id: 'cert-bronze-1',
        type: 'BRONZE',
        hoursCompleted: 10,
        issuedDate: '2025-12-15',
      }
    ]
  },
  streak: 12, // 12 day streak!
  // Set last login to yesterday so we can trigger a "Streak Continued!" toast on load
  lastLoginDate: new Date(Date.now() - 86400000).toISOString()
};

export const MOCK_GEO_COORDS = {
  latitude: 37.7749,
  longitude: -122.4194
};

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm1',
    type: MissionType.FIX_BOUNTY,
    title: 'Broken Streetlight',
    description: 'Streetlight #402 is flickering heavily. Automated sensor report indicating potential circuit failure.',
    location: '4th & Main St',
    distance: '0.1 mi',
    coordinates: { lat: 37.7755, lng: -122.4185 },
    reward: 50,
    status: MissionStatus.OPEN,
    urgency: 'MEDIUM',
    timeEstimate: '5 min',
    verifiedSource: 'City Grid',
    fixData: {
      severity: 'Medium',
      imageUrl: 'https://picsum.photos/id/212/800/600'
    }
  },
  {
    id: 'm5',
    type: MissionType.FIX_BOUNTY,
    title: 'Community Garden Cleanup',
    description: 'Heavy lifting required to clear storm debris from the walkway.',
    location: 'Central Park',
    distance: '0.3 mi',
    coordinates: { lat: 37.7765, lng: -122.4210 },
    reward: 150,
    status: MissionStatus.OPEN,
    urgency: 'MEDIUM',
    timeEstimate: '45 min',
    squadSize: 3,
    currentSquad: 1,
    fixData: {
      severity: 'Medium',
      imageUrl: 'https://picsum.photos/id/118/800/600'
    }
  },
  {
    id: 'm2',
    type: MissionType.FOOD_FIT,
    title: 'Restaurant Surplus Route',
    description: 'Pickup 15 boxed meals from "The Daily Catch" closing shift. Deliver to Downtown Homeless Shelter (verified partner).',
    location: 'The Daily Catch',
    distance: '0.4 mi',
    coordinates: { lat: 37.7735, lng: -122.4220 },
    reward: 80,
    status: MissionStatus.OPEN,
    urgency: 'HIGH',
    timeEstimate: '30 min',
    foodData: {
      allergens: ['Seafood', 'Gluten'],
      expiry: 'Tonight 11pm'
    }
  },
  {
    id: 'm3',
    type: MissionType.LONELY_MINUTES,
    title: 'Afternoon Check-in',
    description: 'Mrs. Higgins would love a 10-minute chat about gardening.',
    location: 'Oak Street Apartments',
    distance: '0.8 mi',
    coordinates: { lat: 37.7720, lng: -122.4150 },
    reward: 100,
    status: MissionStatus.OPEN,
    urgency: 'LOW',
    timeEstimate: '15 min',
    lonelyData: {
      topic: 'Gardening',
      mode: 'CALL'
    }
  },
  {
    id: 'm4',
    type: MissionType.LIFE_SKILL,
    title: 'Safe Lifting Tech',
    description: 'Learn how to lift heavy boxes safely using AR overlay.',
    location: 'Digital',
    distance: 'N/A',
    coordinates: { lat: 37.7749, lng: -122.4194 }, // Centered on user
    reward: 20,
    status: MissionStatus.OPEN,
    urgency: 'LOW',
    timeEstimate: '3 min',
    skillData: {
      moduleName: 'Ergonomics 101',
      arOverlay: true
    }
  }
];

// Concept 1, 6, 10
// Concept 1, 6, 10
// Concept 1, 6, 10
export const INITIAL_RESOURCES: CommunityResource[] = [
  {
    id: 'r1',
    type: ResourceType.HOSPITAL,
    name: 'St. Mary Community Hospital',
    description: '24/7 Emergency Room & Trauma Center. Free clinic on Tuesdays.',
    location: { lat: 37.7780, lng: -122.4100, address: '450 Stanyan St' },
    contact: { phone: '555-0199', hours: '24/7' },
    services: ['Emergency', 'Pediatrics'],
    verified: true,
    lastUpdated: new Date()
  },
  {
    id: 'r2',
    type: ResourceType.FOOD_BANK,
    name: 'City Harvest Food Bank',
    description: 'Distributing fresh produce daily 8am-4pm.',
    location: { lat: 37.7710, lng: -122.4250, address: '800 Market St' },
    contact: { phone: '555-0244', hours: '8am - 4pm' },
    services: ['Food Distribution', 'Nutrition Counseling'],
    verified: true,
    lastUpdated: new Date()
  },
  {
    id: 'r3',
    type: ResourceType.SHELTER,
    name: 'Safe Haven Night Shelter',
    description: 'Overnight beds and warm meals for those in need.',
    location: { lat: 37.7690, lng: -122.4120, address: '200 Main St' },
    contact: { phone: '555-0311', hours: '6pm - 8am' },
    services: ['Shelter', 'Meals'],
    verified: true,
    lastUpdated: new Date()
  },
  {
    id: 'r4',
    type: ResourceType.FOOD_BANK,
    name: 'Downtown Community Fridge',
    description: '24/7 accessible fridge for verified neighbors.',
    location: { lat: 37.7760, lng: -122.4180, address: '300 Mission St' },
    contact: { phone: 'N/A', hours: '24/7' },
    services: ['Free Food'],
    verified: true,
    lastUpdated: new Date()
  },
  {
    id: 'r5',
    type: ResourceType.HOSPITAL,
    name: 'General Hospital Pharmacy',
    description: '24h Pharmacy access for urgent reliable prescriptions.',
    location: { lat: 37.7800, lng: -122.4090, address: '1000 Van Ness Ave' },
    contact: { phone: '555-9988', hours: '24/7' },
    services: ['Pharmacy'],
    verified: true,
    lastUpdated: new Date()
  }
];

// Concept 12
export const IMPACT_STARTUPS: ImpactStartup[] = [
  {
    id: 's1',
    name: 'GreenCycle AI',
    description: 'Using computer vision to optimize neighborhood recycling sorting.',
    category: 'Environment',
    fundingStatus: 'Seed',
    website: 'greencycle.ai'
  },
  {
    id: 's2',
    name: 'MediConnect Global',
    description: 'Drone delivery network for urgent medical supplies in rural areas.',
    category: 'Health',
    fundingStatus: 'Series A',
    website: 'mediconnect.io'
  },
  {
    id: 's3',
    name: 'ElderJoy',
    description: 'VR travel experiences for seniors in assisted living to reduce isolation.',
    category: 'Social',
    fundingStatus: 'Grant Needed',
    website: 'elderjoy.org'
  }
];